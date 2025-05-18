import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import TimerSettings from './TimerSettings';
import NotificationSettings from './NotificationSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', name: 'Profile', component: ProfileSettings },
    { id: 'timer', name: 'Timer', component: TimerSettings },
    { id: 'notifications', name: 'Notifications', component: NotificationSettings }
  ];
  
  return (
    <div className="w-full">
      <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card">
        {tabs.map((tab) => 
          activeTab === tab.id && <tab.component key={tab.id} />
        )}
      </div>
    </div>
  );
};

export default Settings;