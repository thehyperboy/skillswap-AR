import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/auth/onboarding-form-enhanced";

export const metadata = {
  title: "Complete Your Profile | SkillSwap AR",
  description: "Set up your profile to start connecting with local educators",
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    redirect("/login");
  }

  const initialData = {
    displayName: user.profile?.displayName ?? user.name ?? "",
    bio: user.profile?.bio ?? "",
    avatarUrl: user.profile?.avatarUrl ?? "",
    city: user.profile?.city ?? "",
    locality: user.profile?.locality ?? "",
    country: user.profile?.country ?? "",
    latitude: user.profile?.latitude ?? undefined,
    longitude: user.profile?.longitude ?? undefined,
    locationPrivacy: user.profile?.locationPrivacy ?? "APPROXIMATE",
    collaborationMode: user.profile?.collaborationMode ?? "HYBRID",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-soft/20 via-white to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 animate-slideInDown">
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal font-heading">
            Welcome to SkillSwap AR
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Let's set up your profile so you can start connecting with educators and learners in your neighborhood.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-brand-soft/30 shadow-glow p-6 sm:p-8 animate-slideInUp">
          <OnboardingForm initialData={initialData} />
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-600 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          <p>Questions? Check out our <a href="/how-it-works" className="text-brand hover:underline font-semibold">how it works guide</a>.</p>
        </div>
      </div>
    </div>
  );
}
