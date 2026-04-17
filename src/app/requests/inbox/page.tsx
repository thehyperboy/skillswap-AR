import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestActions } from "@/components/requests/request-actions";

export default async function RequestsInboxPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  // Get sent requests
  const sentRequests = await prisma.collaborationRequest.findMany({
    where: { senderId: user.id },
    include: {
      recipient: {
        select: { id: true, name: true, email: true },
      },
      skill: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get received requests
  const receivedRequests = await prisma.collaborationRequest.findMany({
    where: { recipientId: user.id },
    include: {
      sender: {
        select: { id: true, name: true, email: true },
      },
      skill: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">⏳ Pending</Badge>;
      case "ACCEPTED":
        return <Badge variant="success">✓ Accepted</Badge>;
      case "DECLINED":
        return <Badge variant="neutral">✗ Declined</Badge>;
      case "CANCELLED":
        return <Badge variant="neutral">⊗ Cancelled</Badge>;
      case "COMPLETED":
        return <Badge variant="info">✓ Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "🔄";
      case "ACCEPTED":
        return "✅";
      case "DECLINED":
        return "❌";
      case "CANCELLED":
        return "🛑";
      case "COMPLETED":
        return "🎉";
      default:
        return "📋";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-charcoal">Collaboration Requests</h1>
        <p className="text-lg text-slate-600">Manage your skill exchange connections and opportunities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <p className="text-sm text-slate-600">Received Requests</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{receivedRequests.length}</p>
        </Card>
        <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <p className="text-sm text-slate-600">Sent Requests</p>
          <p className="mt-2 text-3xl font-bold text-purple-700">{sentRequests.length}</p>
        </Card>
        <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <p className="text-sm text-slate-600">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {[...sentRequests, ...receivedRequests].filter(r => r.status === "ACCEPTED").length}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="received" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            📥 Received ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            📤 Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Received Requests Tab */}
        <TabsContent value="received" className="space-y-4 mt-6">
          {receivedRequests.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-slate-300">
              <div className="space-y-3">
                <p className="text-4xl">📬</p>
                <h3 className="text-lg font-semibold text-charcoal">No requests yet</h3>
                <p className="text-slate-600">When others request to exchange skills with you, they&apos;ll appear here.</p>
              </div>
            </Card>
          ) : (
            receivedRequests.map((request) => (
              <Card key={request.id} className="p-6 hover:shadow-md hover:border-brand/20 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    {/* Sender Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand/60 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(request.sender.name || request.sender.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal">{request.sender.name || request.sender.email}</h3>
                        {request.skill && (
                          <p className="text-sm text-slate-600">
                            wants to learn: <span className="font-medium text-brand">{request.skill.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                        <p className="text-sm text-slate-700 italic">&quot;{request.message}&quot;</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === "PENDING" && (
                    <div className="flex sm:flex-col gap-2">
                      <RequestActions request={request} userId={user.id} />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="space-y-4 mt-6">
          {sentRequests.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-slate-300">
              <div className="space-y-3">
                <p className="text-4xl">📭</p>
                <h3 className="text-lg font-semibold text-charcoal">No sent requests yet</h3>
                <p className="text-slate-600">Head to <span className="font-medium">Explore</span> to find people and send requests!</p>
              </div>
            </Card>
          ) : (
            sentRequests.map((request) => (
              <Card key={request.id} className="p-6 hover:shadow-md hover:border-brand/20 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    {/* Recipient Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(request.recipient.name || request.recipient.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal">{request.recipient.name || request.recipient.email}</h3>
                        {request.skill && (
                          <p className="text-sm text-slate-600">
                            wants to teach you: <span className="font-medium text-brand">{request.skill.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                        <p className="text-sm text-slate-700 italic">&quot;{request.message}&quot;</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(request.status)}</span>
                      <div className="flex items-center justify-between text-xs text-slate-500 flex-1">
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="text-sm text-slate-600 text-right whitespace-nowrap">
                    {request.status === "PENDING" && <p className="text-amber-600">Awaiting response...</p>}
                    {request.status === "ACCEPTED" && <p className="text-green-600">They accepted!</p>}
                    {request.status === "DECLINED" && <p className="text-red-600">They declined</p>}
                    {request.status === "COMPLETED" && <p className="text-blue-600">Session complete</p>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-r from-brand-soft/30 to-transparent border-brand/20">
        <h3 className="font-semibold text-charcoal mb-2">💡 Tips for successful exchanges</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>✓ Be clear about what you want to teach and learn</li>
          <li>✓ Respond quickly to requests to show you&apos;re active</li>
          <li>✓ Rate your exchange partner after sessions to build SkillKarma</li>
          <li>✓ Communicate location and time preferences early</li>
        </ul>
      </Card>
    </div>
  );
}