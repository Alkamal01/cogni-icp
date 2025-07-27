import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { getExtendedEphemeralPublicKey, generateNonce, generateRandomness, jwtToAddress, genAddressSeed, getZkLoginSignature } from '@mysten/sui/zklogin';
import { jwtDecode } from 'jwt-decode';
class ZkLoginService {
    constructor() {
        // Use mainnet for production, devnet for testing
        const network = process.env.REACT_APP_SUI_NETWORK || 'devnet';
        const rpcUrl = network === 'mainnet'
            ? 'https://fullnode.mainnet.sui.io'
            : 'https://fullnode.devnet.sui.io';
        this.suiClient = new SuiClient({ url: rpcUrl });
        // Use our backend proxy to avoid CORS issues
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        this.proverUrl = `${backendUrl}/api/auth/zk-prover`;
        this.saltServerUrl = 'https://salt.api.mystenlabs.com/get_salt';
    }
    /**
     * Step 1: Generate ephemeral key pair and nonce
     */
    async generateEphemeralKeyPair() {
        const { epoch } = await this.suiClient.getLatestSuiSystemState();
        const maxEpoch = Number(epoch) + 2;
        const ephemeralKeyPair = new Ed25519Keypair();
        const randomness = generateRandomness();
        const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);
        // Add detailed logging
        console.log('Nonce generation details:');
        console.log('Public Key:', ephemeralKeyPair.getPublicKey().toBase64());
        console.log('Max Epoch:', maxEpoch);
        console.log('Randomness:', randomness);
        console.log('Generated Nonce:', nonce);
        // Add detailed debugging for initial nonce generation
        console.log('=== INITIAL NONCE GENERATION DEBUG ===');
        console.log('Public key (toBase64):', ephemeralKeyPair.getPublicKey().toBase64());
        console.log('Max epoch (number):', maxEpoch);
        console.log('Randomness (string):', randomness);
        console.log('Randomness type:', typeof randomness);
        console.log('Max epoch type:', typeof maxEpoch);
        console.log('=== END INITIAL NONCE GENERATION DEBUG ===');
        return { ephemeralKeyPair, maxEpoch, randomness, nonce };
    }
    /**
     * Step 2: Generate OAuth URL for Google
     */
    generateGoogleOAuthUrl(clientId, redirectUrl, nonce) {
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=openid&nonce=${nonce}`;
    }
    /**
     * Step 3: Decode JWT from OAuth response
     */
    decodeJwt(encodedJwt) {
        return jwtDecode(encodedJwt);
    }
    /**
     * Step 4: Get user salt from Mysten Labs salt server
     */
    async getUserSalt(jwt) {
        try {
            // For now, generate a deterministic salt based on the JWT to bypass the salt server issue
            // This is a temporary solution until we resolve the Mysten Labs salt server access
            const jwtHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jwt));
            const hashArray = Array.from(new Uint8Array(jwtHash));
            // Take exactly 16 bytes and convert to base64 for the prover
            const saltBytes = hashArray.slice(0, 16);
            const saltBase64 = btoa(String.fromCharCode(...saltBytes));
            console.log('Generated local salt (base64):', saltBase64);
            console.log('Salt bytes length:', saltBytes.length);
            console.log('Salt base64 length:', saltBase64.length);
            return saltBase64;
        }
        catch (error) {
            console.error('Error getting user salt:', error);
            throw error;
        }
    }
    /**
     * Step 5: Generate zkLogin user address
     */
    generateZkLoginAddress(jwt, userSalt) {
        return jwtToAddress(jwt, userSalt);
    }
    /**
     * Step 6: Get ZK proof from prover service
     */
    async getZkProof(request) {
        try {
            console.log('Sending request to prover:', request);
            console.log('Prover URL:', this.proverUrl);
            const response = await fetch(this.proverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                signal: AbortSignal.timeout(30000), // 30 second timeout
            });
            console.log('Prover response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Prover error response:', errorText);
                throw new Error(`Prover error: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            console.log('Prover success response:', result);
            return result;
        }
        catch (error) {
            console.error('Error getting ZK proof:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('Network error - this might be due to:');
                console.error('1. CORS issues (try using a backend proxy)');
                console.error('2. Prover server being down');
                console.error('3. Network connectivity issues');
            }
            throw error;
        }
    }
    /**
     * Step 7: Complete zkLogin flow
     */
    async completeZkLogin(jwt, ephemeralKeyPair, maxEpoch, randomness, nonce) {
        // Decode JWT
        const decodedJwt = this.decodeJwt(jwt);
        console.log('Decoded JWT:', decodedJwt);
        // Get user salt
        const userSalt = await this.getUserSalt(jwt);
        console.log('User salt:', userSalt);
        // Generate zkLogin address
        const saltBytes = Uint8Array.from(atob(userSalt), c => c.charCodeAt(0));
        const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const saltBigInt = BigInt('0x' + saltHex);
        const zkLoginAddress = this.generateZkLoginAddress(jwt, saltBigInt);
        console.log('Generated zkLogin address:', zkLoginAddress);
        // Get extended ephemeral public key
        const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());
        console.log('Extended ephemeral public key:', extendedEphemeralPublicKey.toString());
        // Get ZK proof
        const zkProofRequest = {
            jwt,
            extendedEphemeralPublicKey: extendedEphemeralPublicKey.toString(),
            maxEpoch: maxEpoch.toString(),
            jwtRandomness: randomness,
            salt: userSalt,
            keyClaimName: 'sub'
        };
        console.log('ZK proof request:', zkProofRequest);
        const zkProof = await this.getZkProof(zkProofRequest);
        return {
            zkLoginAddress,
            userSalt,
            decodedJwt,
            zkProof,
            ephemeralKeyPair,
            maxEpoch
        };
    }
    /**
     * Step 8: Sign and submit transaction
     */
    async signAndSubmitTransaction(zkLoginAddress, ephemeralKeyPair, zkProof, maxEpoch, decodedJwt, userSalt, transactionBlock) {
        // Set sender
        transactionBlock.setSender(zkLoginAddress);
        // Sign transaction with ephemeral key
        const { bytes, signature: userSignature } = await transactionBlock.sign({
            client: this.suiClient,
            signer: ephemeralKeyPair,
        });
        // Generate address seed
        const addressSeed = genAddressSeed(BigInt(userSalt), 'sub', decodedJwt.sub, Array.isArray(decodedJwt.aud) ? decodedJwt.aud[0] : decodedJwt.aud).toString();
        // Create zkLogin signature
        const zkLoginSignature = getZkLoginSignature({
            inputs: {
                ...zkProof,
                addressSeed,
            },
            maxEpoch,
            userSignature,
        });
        // Execute transaction
        const result = await this.suiClient.executeTransactionBlock({
            transactionBlock: bytes,
            signature: zkLoginSignature,
        });
        return result;
    }
    /**
     * Complete zkLogin authentication flow
     */
    async authenticateWithZkLogin(clientId, redirectUrl, onOAuthRedirect) {
        try {
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nStarting authenticateWithZkLogin at: ' + new Date().toISOString());
            // Step 1: Generate ephemeral key pair and nonce
            const { ephemeralKeyPair, maxEpoch, randomness, nonce } = await this.generateEphemeralKeyPair();
            console.log('Generated nonce during setup:', nonce);
            console.log('Generated maxEpoch during setup:', maxEpoch);
            console.log('Generated randomness during setup:', randomness);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nGenerated nonce: ' + nonce);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nGenerated maxEpoch: ' + maxEpoch);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nGenerated randomness: ' + randomness);
            // Step 2: Generate OAuth URL
            const oauthUrl = this.generateGoogleOAuthUrl(clientId, redirectUrl, nonce);
            // Step 3: Redirect user to OAuth
            onOAuthRedirect(oauthUrl);
            // Store ephemeral key pair in session storage for later use
            const privateKeyBytes = ephemeralKeyPair.getSecretKey();
            const privateKeyOnly = privateKeyBytes.slice(0, 32);
            console.log('=== STORING IN SESSION STORAGE ===');
            console.log('Private key length:', privateKeyOnly.length);
            console.log('Max epoch:', maxEpoch);
            console.log('Randomness:', randomness);
            console.log('Nonce:', nonce);
            // Debug the original private key
            console.log('=== ORIGINAL PRIVATE KEY DEBUG ===');
            console.log('getSecretKey() result:', privateKeyBytes);
            console.log('getSecretKey() type:', typeof privateKeyBytes);
            console.log('getSecretKey() length:', privateKeyBytes.length);
            console.log('getSecretKey() constructor:', privateKeyBytes.constructor.name);
            console.log('Private key only (first 32 bytes):', privateKeyOnly);
            console.log('Private key only type:', typeof privateKeyOnly);
            console.log('Private key only constructor:', privateKeyOnly.constructor.name);
            console.log('Private key only length:', privateKeyOnly.length);
            console.log('Private key only sample (first 5 bytes):', [privateKeyOnly[0], privateKeyOnly[1], privateKeyOnly[2], privateKeyOnly[3], privateKeyOnly[4]]);
            console.log('Original private key array:', Array.from(privateKeyOnly));
            console.log('Original private key array type:', typeof Array.from(privateKeyOnly));
            console.log('Original private key array length:', Array.from(privateKeyOnly).length);
            console.log('Original public key:', ephemeralKeyPair.getPublicKey().toBase64());
            console.log('=== END ORIGINAL PRIVATE KEY DEBUG ===');
            // Store as numbers, not strings
            const privateKeyArray = new Array(32);
            console.log('=== ARRAY CREATION DEBUG ===');
            console.log('privateKeyOnly length:', privateKeyOnly.length);
            console.log('privateKeyOnly sample:', [privateKeyOnly[0], privateKeyOnly[1], privateKeyOnly[2], privateKeyOnly[3], privateKeyOnly[4]]);
            for (let i = 0; i < 32; i++) {
                const byte = privateKeyOnly[i];
                console.log(`Byte ${i}: ${byte} (type: ${typeof byte})`);
                privateKeyArray[i] = byte;
            }
            console.log('Final private key array to store:', privateKeyArray);
            console.log('Final private key array length:', privateKeyArray.length);
            console.log('Final private key array sample:', privateKeyArray.slice(0, 5));
            console.log('=== END ARRAY CREATION DEBUG ===');
            // Verify the array is correct before storing
            if (privateKeyArray.length !== 32) {
                throw new Error(`Invalid private key array length: ${privateKeyArray.length}, expected 32`);
            }
            if (privateKeyArray.some((byte) => byte === null || byte === undefined || isNaN(byte))) {
                throw new Error('Private key array contains invalid values');
            }
            sessionStorage.setItem('zkLogin_ephemeralKeyPair', JSON.stringify(privateKeyArray));
            sessionStorage.setItem('zkLogin_maxEpoch', maxEpoch.toString());
            sessionStorage.setItem('zkLogin_randomness', randomness);
            sessionStorage.setItem('zkLogin_nonce', nonce);
            // Also store in localStorage as backup for debugging
            localStorage.setItem('zkLogin_backup_ephemeralKeyPair', JSON.stringify(privateKeyArray));
            localStorage.setItem('zkLogin_backup_maxEpoch', maxEpoch.toString());
            localStorage.setItem('zkLogin_backup_randomness', randomness);
            localStorage.setItem('zkLogin_backup_nonce', nonce);
            console.log('Storing in session storage:');
            console.log('zkLogin_nonce:', nonce);
            console.log('zkLogin_maxEpoch:', maxEpoch);
            console.log('zkLogin_randomness:', randomness);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nStored in session storage:');
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\n- zkLogin_nonce: ' + nonce);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\n- zkLogin_maxEpoch: ' + maxEpoch);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\n- zkLogin_randomness: ' + randomness);
            return { oauthUrl, nonce };
        }
        catch (error) {
            console.error('Error starting zkLogin flow:', error);
            localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nError in authenticateWithZkLogin: ' + error);
            throw error;
        }
    }
    /**
     * Handle OAuth callback and complete zkLogin
     */
    async handleOAuthCallback(jwt) {
        try {
            console.log('Starting handleOAuthCallback...');
            // Debug the JWT to see what nonce was used
            const decodedJwt = this.decodeJwt(jwt);
            console.log('=== JWT DEBUG ===');
            console.log('JWT nonce:', decodedJwt.nonce);
            console.log('JWT subject:', decodedJwt.sub);
            console.log('JWT issuer:', decodedJwt.iss);
            console.log('=== END JWT DEBUG ===');
            // Check if we have any debug logs from the original flow
            const debugLog = localStorage.getItem('zkLogin_debug');
            console.log('=== DEBUG LOG CHECK ===');
            console.log('Debug log exists:', !!debugLog);
            if (debugLog) {
                console.log('Debug log content:', debugLog);
                // Try to extract the original nonce from debug logs
                const nonceMatch = debugLog.match(/Generated nonce: ([^\n]+)/);
                if (nonceMatch) {
                    const originalNonce = nonceMatch[1];
                    console.log('Original nonce from debug logs:', originalNonce);
                    console.log('JWT nonce matches original:', decodedJwt.nonce === originalNonce);
                    if (decodedJwt.nonce !== originalNonce) {
                        console.warn('JWT nonce does not match original nonce from debug logs!');
                        console.warn('This suggests the user is accessing an old callback URL.');
                        console.warn('Clearing old data and aborting...');
                        this.clearSessionStorage();
                        localStorage.removeItem('zkLogin_backup_ephemeralKeyPair');
                        localStorage.removeItem('zkLogin_backup_maxEpoch');
                        localStorage.removeItem('zkLogin_backup_randomness');
                        localStorage.removeItem('zkLogin_backup_nonce');
                        throw new Error('JWT nonce does not match original nonce. Please start a fresh zkLogin flow.');
                    }
                    // Check if there was an error in the original flow
                    if (debugLog.includes('Error in authenticateWithZkLogin')) {
                        console.warn('Error detected in original zkLogin flow!');
                        console.warn('The ephemeral key generation failed. Clearing data and aborting...');
                        this.clearSessionStorage();
                        localStorage.removeItem('zkLogin_backup_ephemeralKeyPair');
                        localStorage.removeItem('zkLogin_backup_maxEpoch');
                        localStorage.removeItem('zkLogin_backup_randomness');
                        localStorage.removeItem('zkLogin_backup_nonce');
                        throw new Error('Previous zkLogin flow failed. Please try again by clicking the login button.');
                    }
                }
            }
            else {
                // No debug log found - this means the user didn't go through the proper flow
                console.warn('No debug log found! This means the user accessed the callback URL directly.');
                console.warn('The user must go through the proper zkLogin initiation flow.');
                this.clearSessionStorage();
                localStorage.removeItem('zkLogin_backup_ephemeralKeyPair');
                localStorage.removeItem('zkLogin_backup_maxEpoch');
                localStorage.removeItem('zkLogin_backup_randomness');
                localStorage.removeItem('zkLogin_backup_nonce');
                throw new Error('No zkLogin session found. Please start a fresh zkLogin flow by clicking the login button.');
            }
            console.log('=== END DEBUG LOG CHECK ===');
            // Retrieve stored ephemeral key pair
            const storedPrivateKey = sessionStorage.getItem('zkLogin_ephemeralKeyPair');
            const storedMaxEpoch = sessionStorage.getItem('zkLogin_maxEpoch');
            const storedRandomness = sessionStorage.getItem('zkLogin_randomness');
            const storedNonce = sessionStorage.getItem('zkLogin_nonce');
            console.log('=== SESSION STORAGE RETRIEVAL ===');
            console.log('Stored private key exists:', !!storedPrivateKey);
            console.log('Stored maxEpoch exists:', !!storedMaxEpoch);
            console.log('Stored randomness exists:', !!storedRandomness);
            console.log('Stored nonce exists:', !!storedNonce);
            // If session storage is empty, try localStorage backup
            if (!storedPrivateKey || !storedMaxEpoch || !storedRandomness || !storedNonce) {
                console.log('Session storage missing data, trying localStorage backup...');
                const backupPrivateKey = localStorage.getItem('zkLogin_backup_ephemeralKeyPair');
                const backupMaxEpoch = localStorage.getItem('zkLogin_backup_maxEpoch');
                const backupRandomness = localStorage.getItem('zkLogin_backup_randomness');
                const backupNonce = localStorage.getItem('zkLogin_backup_nonce');
                console.log('Backup data exists:', {
                    hasPrivateKey: !!backupPrivateKey,
                    hasMaxEpoch: !!backupMaxEpoch,
                    hasRandomness: !!backupRandomness,
                    hasNonce: !!backupNonce
                });
                // Debug what's in localStorage
                console.log('=== LOCALSTORAGE DEBUG ===');
                console.log('Backup private key:', backupPrivateKey);
                console.log('Backup maxEpoch:', backupMaxEpoch);
                console.log('Backup randomness:', backupRandomness);
                console.log('Backup nonce:', backupNonce);
                console.log('=== END LOCALSTORAGE DEBUG ===');
                if (backupPrivateKey && backupMaxEpoch && backupRandomness && backupNonce) {
                    console.log('Using localStorage backup data');
                    // Restore to session storage
                    sessionStorage.setItem('zkLogin_ephemeralKeyPair', backupPrivateKey);
                    sessionStorage.setItem('zkLogin_maxEpoch', backupMaxEpoch);
                    sessionStorage.setItem('zkLogin_randomness', backupRandomness);
                    sessionStorage.setItem('zkLogin_nonce', backupNonce);
                }
            }
            // Re-retrieve after potential restoration
            const finalPrivateKey = sessionStorage.getItem('zkLogin_ephemeralKeyPair');
            const finalMaxEpoch = sessionStorage.getItem('zkLogin_maxEpoch');
            const finalRandomness = sessionStorage.getItem('zkLogin_randomness');
            const finalNonce = sessionStorage.getItem('zkLogin_nonce');
            if (!finalPrivateKey || !finalMaxEpoch || !finalRandomness) {
                throw new Error('Missing ephemeral key pair data in session storage');
            }
            const privateKeyArray = JSON.parse(finalPrivateKey);
            console.log('Private key array length:', privateKeyArray.length);
            console.log('Private key array sample:', privateKeyArray.slice(0, 5));
            // Verify the retrieved array is valid
            if (privateKeyArray.length !== 32) {
                console.warn('Invalid secretKey size in sessionStorage. Expected 32 bytes, got', privateKeyArray.length, '. Clearing sessionStorage and aborting.');
                this.clearSessionStorage();
                localStorage.removeItem('zkLogin_backup_ephemeralKeyPair');
                localStorage.removeItem('zkLogin_backup_maxEpoch');
                localStorage.removeItem('zkLogin_backup_randomness');
                localStorage.removeItem('zkLogin_backup_nonce');
                throw new Error('Invalid secretKey size in sessionStorage. Please try logging in again.');
            }
            if (privateKeyArray.some((byte) => byte === null || byte === undefined || isNaN(byte))) {
                console.warn('Private key array contains invalid values. Clearing storage and aborting.');
                this.clearSessionStorage();
                localStorage.removeItem('zkLogin_backup_ephemeralKeyPair');
                localStorage.removeItem('zkLogin_backup_maxEpoch');
                localStorage.removeItem('zkLogin_backup_randomness');
                localStorage.removeItem('zkLogin_backup_nonce');
                throw new Error('Private key array contains invalid values. Please try logging in again.');
            }
            const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
            const maxEpoch = parseInt(finalMaxEpoch);
            const randomness = finalRandomness;
            const nonce = finalNonce;
            if (!nonce) {
                throw new Error('No nonce found in sessionStorage');
            }
            // Log reconstructed public key
            const reconstructedPublicKey = ephemeralKeyPair.getPublicKey().toBase64();
            console.log('Reconstructed Public Key:', reconstructedPublicKey);
            // Add detailed debugging for nonce verification
            console.log('=== NONCE VERIFICATION DEBUG ===');
            console.log('Stored nonce:', nonce);
            console.log('Stored maxEpoch:', maxEpoch);
            console.log('Stored randomness:', randomness);
            console.log('Reconstructed public key:', reconstructedPublicKey);
            // Verify nonce generation with detailed logging
            console.log('=== GENERATE NONCE INPUTS ===');
            console.log('Public key (toBase64):', ephemeralKeyPair.getPublicKey().toBase64());
            console.log('Max epoch (number):', maxEpoch);
            console.log('Randomness (string):', randomness);
            console.log('Randomness type:', typeof randomness);
            console.log('Max epoch type:', typeof maxEpoch);
            const verifyNonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);
            console.log('Computed nonce:', verifyNonce);
            console.log('Nonce match:', verifyNonce === nonce);
            console.log('=== END NONCE VERIFICATION DEBUG ===');
            if (verifyNonce !== nonce) {
                throw new Error(`Nonce verification failed! Stored: ${nonce}, Computed: ${verifyNonce}`);
            }
            console.log('Using stored nonce:', nonce);
            // Verify JWT nonce matches stored nonce (for security)
            if (decodedJwt.nonce && decodedJwt.nonce !== nonce) {
                console.warn('Warning: JWT nonce does not match stored nonce');
                console.log('JWT nonce:', decodedJwt.nonce);
                console.log('Stored nonce:', nonce);
                // This might indicate a security issue or implementation error
                // You might want to handle this case more strictly in production
            }
            console.log('Ephemeral key pair reconstructed successfully');
            console.log('Max epoch:', maxEpoch);
            console.log('Randomness:', randomness);
            console.log('Using stored nonce:', nonce);
            // Complete zkLogin flow
            const result = await this.completeZkLogin(jwt, ephemeralKeyPair, maxEpoch, randomness, nonce);
            // Clear session storage
            this.clearSessionStorage();
            console.log('zkLogin completed successfully');
            return result;
        }
        catch (error) {
            console.error('Error handling OAuth callback:', error);
            this.clearSessionStorage();
            throw error;
        }
    }
    /**
     * Clear all zkLogin-related session storage
     */
    clearSessionStorage() {
        sessionStorage.removeItem('zkLogin_ephemeralKeyPair');
        sessionStorage.removeItem('zkLogin_maxEpoch');
        sessionStorage.removeItem('zkLogin_randomness');
        sessionStorage.removeItem('zkLogin_nonce');
    }
    /**
     * Create a simple transaction (e.g., transfer SUI)
     */
    async createTransferTransaction(zkLoginAddress, recipientAddress, amount) {
        const txb = new Transaction();
        // Transfer SUI
        const [coin] = txb.splitCoins(txb.gas, [amount]);
        txb.transferObjects([coin], recipientAddress);
        return txb;
    }
}
export default new ZkLoginService();
