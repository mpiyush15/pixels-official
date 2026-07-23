import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const db = await getDatabase();
    const leads = await db
      .collection('leads')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const lead = {
      ...body,
      status: 'new',
      createdAt: new Date(),
    };

    const result = await db.collection('leads').insertOne(lead);

    // Send Email Notification
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zeptomail.in',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || 'emailapikey',
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@pixelsdigitalsolutions.com',
        to: 'mpiyush2727@gmail.com',
        subject: `New Lead: ${body.name}`,
        text: `You have a new lead!\n\nName: ${body.name}\nEmail: ${body.email}\nPhone: ${body.phone || 'N/A'}\nService: ${body.service || 'N/A'}\nMessage: ${body.message}\nSource: ${body.source || 'Website Form'}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${body.service || 'N/A'}</p>
          <p><strong>Message:</strong><br/> ${body.message}</p>
          <p><strong>Source:</strong> ${body.source || 'Website Form'}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // We don't throw here to ensure the lead still gets created even if email fails
    }

    return NextResponse.json({
      success: true,
      leadId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
