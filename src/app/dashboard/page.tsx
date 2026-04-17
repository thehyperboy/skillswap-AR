import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email },
    include: {
      profile: true,
      skillKarma: true,
      offeredSkills: { include: { skill: true } },
      wantedSkills: { include: { skill: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const profileCompletion = Math.round(
    ((user.profile?.displayName ? 1 : 0) + 
     (user.profile?.bio ? 1 : 0) + 
     (user.profile?.city ? 1 : 0) + 
     (user.profile?.latitude ? 1 : 0)) / 4 * 100
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Welcome back, {user.profile?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="mt-1 text-slate-600">Here&apos;s your skill exchange overview</p>
        </div>
        <SignOutButton />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "⭐", label: "SkillKarma", value: user.skillKarma?.points ?? 0 },
          { icon: "✅", label: "Sessions Completed", value: user.skillKarma?.completedSessionCount ?? 0 },
          { icon: "📍", label: "Location", value: user.profile?.city || "Not set" },
          { icon: "👥", label: "Skills Offered", value: user.offeredSkills.length },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 bg-gradient-to-br from-brand-soft/40 to-white hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-charcoal">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Profile Completion */}
      <Card className="p-6 border-2 border-brand-soft bg-gradient-to-r from-brand-soft/20 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-charcoal">Profile Completion</h3>
          <span className="text-lg font-bold text-brand">{profileCompletion}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-brand to-[#2a6f3b] h-2 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-600 mb-4">Complete your profile to unlock more features and appear higher in discovery results.</p>
        <Link href="/onboarding" className="inline-block">
          <Button className="bg-brand hover:bg-[#2a6f3b] text-white w-full">
            Complete Profile
          </Button>
        </Link>
      </Card>

      {/* Skills Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Offered Skills */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Skills You Offer</h3>
            <Badge variant="success">{user.offeredSkills.length}</Badge>
          </div>
          {user.offeredSkills.length > 0 ? (
            <div className="space-y-3">
              {user.offeredSkills.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <p className="font-medium text-charcoal">{item.skill.name}</p>
                    <p className="text-xs text-slate-600 capitalize">{item.proficiency} level</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">Teaching</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm mb-3">No skills offered yet</p>
              <Link href="/onboarding">
                <Button variant="outline" className="text-xs">
                  Add Skills
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Wanted Skills */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Skills You Want to Learn</h3>
            <Badge variant="info">{user.wantedSkills.length}</Badge>
          </div>
          {user.wantedSkills.length > 0 ? (
            <div className="space-y-3">
              {user.wantedSkills.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-medium text-charcoal">{item.skill.name}</p>
                    <p className="text-xs text-slate-600">Looking to learn</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">Learning</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm mb-3">No skills added to your learning list</p>
              <Link href="/onboarding">
                <Button variant="outline" className="text-xs">
                  Add Skills
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Location & Privacy */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Location & Discovery Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">📍 Current Location</p>
            <p className="text-lg font-semibold text-charcoal">
              {user.profile?.city ? `${user.profile.city}${user.profile.locality ? ', ' + user.profile.locality : ''}` : 'Not set'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">👁️ Visibility Status</p>
            <p className="text-lg font-semibold text-brand">Visible to nearby users</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-4">Update your location to appear in nearby skill matches</p>
        <Link href="/onboarding" className="inline-block mt-4 w-full">
          <Button className="bg-brand hover:bg-[#2a6f3b] text-white text-sm w-full">
            Update Location
          </Button>
        </Link>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <a href="/explore" className="p-6 rounded-lg border-2 border-slate-200 hover:border-brand hover:bg-brand-soft/20 transition text-center group">
          <span className="text-3xl block mb-2">🔍</span>
          <h4 className="font-semibold text-charcoal group-hover:text-brand">Explore Nearby</h4>
          <p className="text-xs text-slate-600 mt-1">Find skill exchange opportunities</p>
        </a>
        
        <a href="/requests/inbox" className="p-6 rounded-lg border-2 border-slate-200 hover:border-brand hover:bg-brand-soft/20 transition text-center group">
          <span className="text-3xl block mb-2">💬</span>
          <h4 className="font-semibold text-charcoal group-hover:text-brand">My Requests</h4>
          <p className="text-xs text-slate-600 mt-1">View pending collaboration requests</p>
        </a>
        
        <a href="/how-it-works" className="p-6 rounded-lg border-2 border-slate-200 hover:border-brand hover:bg-brand-soft/20 transition text-center group">
          <span className="text-3xl block mb-2">📚</span>
          <h4 className="font-semibold text-charcoal group-hover:text-brand">Learn More</h4>
          <p className="text-xs text-slate-600 mt-1">Understand how skill exchange works</p>
        </a>
      </div>
    </div>
  );
}

