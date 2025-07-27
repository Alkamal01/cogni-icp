import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../shared';
import { StudyGroup } from '../../services/collaborationService';

interface GroupSelectorProps {
  groups: StudyGroup[];
  selectedGroupId: number | null;
  onGroupSelect: (groupId: number) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onGroupSelect
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Select Study Group
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedGroupId === group.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onGroupSelect(group.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {group.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {group.members.length} members • {group.skill_level}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupSelector; 