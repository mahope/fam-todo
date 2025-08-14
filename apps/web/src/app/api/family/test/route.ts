import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Family API endpoints are available',
    endpoints: {
      'GET /api/family': 'Get family information',
      'PUT /api/family': 'Update family settings (admin only)',
      'GET /api/family/members': 'Get all family members (admin only)',
      'POST /api/family/members': 'Invite new family member (admin only)',
      'GET /api/family/members/[id]': 'Get specific member (self or admin)',
      'PUT /api/family/members/[id]': 'Update member (self or admin)',
      'DELETE /api/family/members/[id]': 'Delete member (admin only)',
      'GET /api/family/invites': 'Get pending invites (admin only)',
      'DELETE /api/family/invites?id=...': 'Cancel invite (admin only)',
    },
    timestamp: new Date().toISOString()
  });
}