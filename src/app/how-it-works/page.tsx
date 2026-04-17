import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Getting Started</p>
        <h1 className="text-4xl font-bold text-charcoal">How SkillSwap AR Works</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Learn, teach, and connect with your local community through skill exchange</p>
      </div>

      {/* Main Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-charcoal text-center">Your skill exchange journey in 5 steps</h2>
        <div className="grid gap-6">
          {[
            {
              step: "1",
              title: "Create Your Profile",
              description: "Sign up and tell us about yourself, your location, and the skills you want to teach and learn.",
              icon: "👤",
              color: "from-blue-500"
            },
            {
              step: "2",
              title: "Explore Your Community",
              description: "Discover people nearby who want to learn what you teach and can teach what you want to learn.",
              icon: "🗺️",
              color: "from-green-500"
            },
            {
              step: "3",
              title: "Send a Request",
              description: "Reach out with a personalized message and suggest a time and location for your skill exchange.",
              icon: "💬",
              color: "from-purple-500"
            },
            {
              step: "4",
              title: "Meet & Exchange",
              description: "Meet in your chosen location (online or offline) and exchange skills for the agreed duration.",
              icon: "🤝",
              color: "from-orange-500"
            },
            {
              step: "5",
              title: "Rate & Earn",
              description: "Rate each other's skills and teaching style. Earn SkillKarma points and unlock badges.",
              icon: "⭐",
              color: "from-yellow-500"
            }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className={`flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br ${item.color} to-transparent flex items-center justify-center text-3xl shadow-lg`}>
                {item.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline gap-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-sm font-bold text-charcoal">Step {item.step}</span>
                  <h3 className="text-xl font-bold text-charcoal">{item.title}</h3>
                </div>
                <p className="mt-2 text-slate-600 text-lg">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features Section */}
      <div className="space-y-6 py-8">
        <h2 className="text-2xl font-bold text-charcoal text-center">Why SkillSwap AR?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Location-Based Matching",
              description: "Find skill exchange partners within your neighborhood using AR mapping technology"
            },
            {
              title: "SkillKarma System",
              description: "Build your reputation through successful exchanges and unlock community badges"
            },
            {
              title: "Flexible Formats",
              description: "Choose between online sessions, offline meetups, or hybrid skill exchanges"
            },
            {
              title: "Secure & Verified",
              description: "All members are verified, with ratings displayed to build trust in the community"
            },
            {
              title: "In-App Communication",
              description: "Chat with potential partners before committing to schedule your meetings"
            },
            {
              title: "Real Outcomes",
              description: "Learn practical skills from local experts and teach what you know best"
            }
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-charcoal">{feature.title}</h3>
              <p className="mt-3 text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 py-8">
        <h2 className="text-2xl font-bold text-charcoal text-center">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: "Is it really free?",
              a: "Yes! SkillSwap AR is completely free. We operate on the principle of mutual skill exchange with no payment required."
            },
            {
              q: "How do I know if people are real?",
              a: "All members are verified with email confirmation and can build reputation through SkillKarma ratings from previous skill exchanges."
            },
            {
              q: "What if I don't complete a session?",
              a: "You can cancel or reschedule. Just communicate with your partner. Consistent cancellations may affect your reputation."
            },
            {
              q: "Can I choose online instead of meeting?",
              a: "Absolutely! When requesting a skill exchange, you can suggest online, offline, or hybrid options based on your preference."
            },
            {
              q: "How does SkillKarma work?",
              a: "After each session, both participants rate each other. Your rating contributes to your SkillKarma score, which helps build community trust."
            },
            {
              q: "What skills can I teach or learn?",
              a: "Any skill! From languages and music to coding and cooking. We welcome all types of knowledge and expertise."
            }
          ].map((item, idx) => (
            <Card key={idx} className="p-6 bg-slate-50">
              <h4 className="font-semibold text-charcoal">{item.q}</h4>
              <p className="mt-3 text-slate-600">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="rounded-2xl bg-gradient-to-r from-brand via-brand/90 to-brand/80 p-12 text-white text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to start learning?</h2>
        <p className="text-lg text-white/90">Join thousands of neighbors exchanging skills and building community</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button className="bg-white text-brand hover:bg-slate-100 font-semibold px-8 py-3">
              Create Account
            </Button>
          </Link>
          <Link href="/explore">
            <Button className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3">
              Browse Skills First
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
