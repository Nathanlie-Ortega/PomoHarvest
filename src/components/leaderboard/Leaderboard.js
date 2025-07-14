import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { getLevelAndXP } from '../../utils/statsSync';

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [userLevel, setUserLevel] = useState(1);

  // Update user's level in Firestore
  const updateUserLevel = async () => {
    if (!currentUser) return;

    try {
      const levelData = getLevelAndXP();
      const userRef = doc(db, 'leaderboard', currentUser.uid);
      
      await setDoc(userRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email,
        level: levelData.level,
        currentXP: levelData.currentXP,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      setUserLevel(levelData.level);
      console.log('User level updated in leaderboard:', levelData.level);
    } catch (error) {
      console.error('Error updating user level:', error);
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const leaderboardRef = collection(db, 'leaderboard');
      const snapshot = await getDocs(leaderboardRef);
      
      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: data.uid,
          displayName: data.displayName,
          level: data.level || 1,
          currentXP: data.currentXP || 0,
          lastUpdated: data.lastUpdated
        });
      });

      // Sort by level (descending), then by XP (descending)
      users.sort((a, b) => {
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        return b.currentXP - a.currentXP;
      });

      // Add rank to each user
      const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      setLeaderboardData(rankedUsers);

      // Find current user's rank
      if (currentUser) {
        const currentUserData = rankedUsers.find(user => user.uid === currentUser.uid);
        setCurrentUserRank(currentUserData?.rank || null);
      }

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      updateUserLevel().then(() => {
        fetchLeaderboard();
      });
    }
  }, [currentUser]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        updateUserLevel().then(() => {
          fetchLeaderboard();
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getLevelIcon = (level) => {
    if (level >= 15) return '🌲';
    if (level >= 10) return '🌳';
    if (level >= 5) return '🌿';
    return '🌱';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User Stats */}
      {currentUserRank && (
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 border-primary-200 dark:border-primary-800">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {getRankIcon(currentUserRank)}
              </div>
              <div>
                <div className="text-xl font-bold">Rank {currentUserRank}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Level {userLevel} Gardener {getLevelIcon(userLevel)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium flex items-center">
            <span className="mr-2">🏆</span>
            Top Gardeners
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rankings update in real-time based on your gardener level
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gardener
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Garden XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboardData.slice(0, 50).map((user) => (
                <tr 
                  key={user.uid}
                  className={`${
                    user.uid === currentUser?.uid 
                      ? 'bg-primary-50 dark:bg-primary-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-medium">
                      {getRankIcon(user.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.displayName}
                          {user.uid === currentUser?.uid && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getLevelIcon(user.level)}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Level {user.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.currentXP.toLocaleString()} XP
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.level >= 10
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                        : user.level >= 5
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {user.level >= 10 ? 'Expert' : user.level >= 5 ? 'Growing' : 'Beginner'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboardData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              No gardeners yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to start growing and claim the top spot!
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card p-6">
        <h4 className="font-medium mb-3 flex items-center">
          How Rankings Work
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Rankings are based on your Gardener Level from focus sessions</p>
          <p>• Higher levels rank above lower levels</p>
          <p>• Ties are broken by total Garden XP earned</p>
          <p>• Rankings update automatically when you complete sessions</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;