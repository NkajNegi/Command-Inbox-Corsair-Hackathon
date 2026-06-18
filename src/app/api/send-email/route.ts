import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = await db.query.accounts.findFirst({
      where: (accounts, { and, eq }) => and(eq(accounts.userId, session.user.id), eq(accounts.provider, 'google'))
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'No Google access token found' }, { status: 400 });
    }

    const token = account.access_token;

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (!res.ok) {
      console.error('Gmail API send error:', await res.text());
      return NextResponse.json({ error: 'Failed to send via Gmail API' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email dispatched via Gmail API' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
