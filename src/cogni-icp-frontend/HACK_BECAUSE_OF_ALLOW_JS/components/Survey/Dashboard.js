import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Bell, Calendar, ChevronDown, Bookmark, Award, Users, Book } from 'lucide-react';
// Helper functions for calendar
const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};
const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
};
const performanceData = [
    { name: 'Week 1', Animation: 85, UX: 78 },
    { name: 'Week 2', Animation: 88, UX: 82 },
    { name: 'Week 3', Animation: 92, UX: 85 },
    { name: 'Week 4', Animation: 97, UX: 93 },
];
const Dashboard = () => {
    const [currentDate] = useState(new Date());
    const [days, setDays] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const daysInMonth = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);
        const calendarDays = Array.from({ length: firstDay }, () => null)
            .concat([...Array(daysInMonth).keys()].map(day => day + 1));
        setDays(calendarDays);
    }, [currentDate]);
    return (<div className="min-h-screen bg-gray-50">
      {/* Rest of the component remains the same... */}
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 flex items-center">
              <div className="relative w-64">
                <input type="text" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6"/>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <img src="../../ak.png" className="h-8 w-8 rounded-full" alt="Profile"/>
                <ChevronDown className="h-4 w-4 text-gray-500"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grade Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Animation</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">97%</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Book className="h-6 w-6 text-blue-500"/>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">UX Research</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">93%</h3>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-500"/>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">95%</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-500"/>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overall</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">94%</h3>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Award className="h-6 w-6 text-yellow-500"/>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2">
                <option>Last 30 Days</option>
                <option>Last 60 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" stroke="#9CA3AF"/>
                  <YAxis stroke="#9CA3AF"/>
                  <Tooltip />
                  <Line type="monotone" dataKey="Animation" stroke="#3B82F6" strokeWidth={2}/>
                  <Line type="monotone" dataKey="UX" stroke="#8B5CF6" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="h-5 w-5 text-gray-500"/>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (<span key={day} className="text-xs font-medium text-gray-500 py-1">{day}</span>))}
              {days.map((day, index) => (<span key={index} className={`py-2 text-sm ${day ? "text-gray-900" : "text-gray-300"} ${day === currentDate.getDate()
                ? "bg-blue-500 text-white rounded-full font-medium"
                : ""}`}>
                  {day || ""}
                </span>))}
            </div>
          </div>

          {/* Students of the Week */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Students of the Week</h3>
              <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
            { name: "Juliana Morgan", attendance: "90%", performance: "85%" },
            { name: "Jack Gilbert", attendance: "100%", performance: "95%" },
            { name: "Petra Barr", attendance: "85%", performance: "80%" }
        ].map((student, index) => (<div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <img src="/api/placeholder/64/64" className="w-16 h-16 rounded-full mx-auto mb-3" alt={student.name}/>
                  <h4 className="font-medium text-gray-900">{student.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">Attendance: {student.attendance}</p>
                  <p className="text-sm text-gray-500">Performance: {student.performance}</p>
                </div>))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
            </div>
            <div className="space-y-4">
              {[
            { title: "Illustration Class", time: "10 AM", date: "Feb 1", type: "class" },
            { title: "UX Writing Lecture", time: "12 PM", date: "Feb 7", type: "lecture" },
            { title: "Game Dev 3D Modeling", time: "2 PM", date: "Feb 20", type: "workshop" }
        ].map((event, index) => (<div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <Bookmark className="h-5 w-5 text-blue-500"/>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500">{event.time}, {event.date}</p>
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
export default Dashboard;
