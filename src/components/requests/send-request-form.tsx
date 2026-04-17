'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SendRequestFormProps {
  recipientId: string;
  recipientName: string;
  availableSkills?: Array<{ id: string; name: string }>;
  trigger: React.ReactNode;
}

export function SendRequestForm({ recipientId, recipientName, availableSkills = [], trigger }: SendRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          skillId: selectedSkillId || undefined,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Collaboration request sent successfully!');
        setOpen(false);
        setMessage('');
        setSelectedSkillId('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send request');
      }
    } catch {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Collaboration Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Request to: {recipientName}
            </label>
          </div>

          {availableSkills.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Related Skill (optional)
              </label>
              <Select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}>
                <option value="">Select a skill...</option>
                {availableSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Message *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you'd like to collaborate on..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}