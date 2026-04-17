'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from 'phosphor-react';
import { SendRequestForm } from '@/components/requests/send-request-form';

interface NearbyUser {
  userId: string;
  displayName: string;
  city?: string;
  locality?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  collaborationMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  skillKarma: number;
  locationPrivacy: 'PUBLIC' | 'APPROXIMATE' | 'PRIVATE';
}

export default function ExplorePage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'HYBRID'>('ALL');

  const fetchNearbyUsers = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/nearby?lat=${userLocation.latitude}&lon=${userLocation.longitude}&radius=10`
      );
      if (response.ok) {
        const data = await response.json();
        setNearbyUsers(data.nearby);
      } else {
        console.error('Failed to fetch nearby users');
      }
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Fetch nearby users when location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyUsers();
    }
  }, [userLocation, fetchNearbyUsers]);

  const filteredUsers = filter === 'ALL' 
    ? nearbyUsers 
    : nearbyUsers.filter(u => u.collaborationMode === filter);

  if (locationError) {
    return (
      <div className="space-y-6 pb-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-charcoal">Explore Nearby</h1>
          <p className="text-slate-600">Find skill exchange opportunities around you</p>
        </div>
        <EmptyState
          title="📍 Location access needed"
          description={locationError}
          action={
            <Button onClick={() => window.location.reload()} className="bg-brand hover:bg-[#2a6f3b] text-white">
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-charcoal">Explore Nearby Learners</h1>
        <p className="text-lg text-slate-600">Discover skill exchange opportunities in your area</p>
      </div>

      {!userLocation && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="text-5xl animate-bounce">📍</div>
          <Spinner className="w-6 h-6 animate-spin" />
          <p className="text-slate-600">Getting your location...</p>
        </div>
      )}

      {userLocation && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ONLINE', 'OFFLINE', 'HYBRID'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === mode
                      ? 'bg-brand text-white shadow-md'
                      : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                  }`}
                >
                  {mode === 'ALL' ? '📍 All' : mode === 'ONLINE' ? '💻 Online' : mode === 'OFFLINE' ? '👥 In-Person' : '🔄 Hybrid'}
                </button>
              ))}
            </div>
            <button
              onClick={fetchNearbyUsers}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand-soft transition disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
              <Spinner className="w-8 h-8 animate-spin text-brand" />
              <p className="text-slate-600">Finding nearby skill exchangers...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <Card key={user.userId} className="p-6 hover:shadow-lg hover:border-brand/30 transition overflow-hidden relative group">
                  {/* Background accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/10 to-transparent rounded-bl-3xl group-hover:from-brand/20 transition"></div>
                  
                  <div className="relative space-y-4">
                    {/* Header with Avatar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand to-[#2a6f3b] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-charcoal">{user.displayName}</h3>
                          <p className="text-sm text-slate-500">
                            {user.city && `${user.city}`}
                            {user.locality && `, ${user.locality}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location & Distance */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📍</span>
                      <span className="font-medium">{user.distanceKm.toFixed(1)} km away</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={
                          user.collaborationMode === 'ONLINE' ? 'info' 
                          : user.collaborationMode === 'OFFLINE' ? 'success'
                          : 'warning'
                        }
                        className="text-xs"
                      >
                        {user.collaborationMode === 'ONLINE' ? '💻' : user.collaborationMode === 'OFFLINE' ? '👥' : '🔄'} {user.collaborationMode}
                      </Badge>
                      <Badge variant="neutral" className="text-xs">
                        ⭐ Karma: {user.skillKarma}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <SendRequestForm
                        recipientId={user.userId}
                        recipientName={user.displayName}
                        trigger={
                          <Button className="flex-1 bg-brand hover:bg-[#2a6f3b] text-white text-sm">
                            Request Session
                          </Button>
                        }
                      />
                      <Button variant="outline" className="flex-1 text-sm border-slate-300">
                        Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="col-span-full">
              <EmptyState
                title="🌍 No users nearby yet"
                description={`No one is offering ${filter !== 'ALL' ? filter.toLowerCase() : 'skill exchanges'} in your area right now. Check back later or expand your radius!`}
                action={<Button onClick={fetchNearbyUsers} className="bg-brand hover:bg-[#2a6f3b] text-white">Refresh</Button>}
              />
            </div>
          )}

          {/* Stats Footer */}
          {filteredUsers.length > 0 && (
            <div className="p-6 rounded-lg bg-gradient-to-r from-brand-soft/40 to-transparent border border-brand-soft">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Found nearby</p>
                  <p className="text-2xl font-bold text-charcoal">{filteredUsers.length} skill exchangers</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Average karma</p>
                  <p className="text-2xl font-bold text-brand">
                    ⭐ {(filteredUsers.reduce((sum, u) => sum + u.skillKarma, 0) / filteredUsers.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
