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
        text: `You have a new lead!\n\nName: ${body.name}\nEmail: ${body.email}\nPhone: ${body.phone || 'N/A'}\nCompany: ${body.companyName || 'N/A'}\nIndustry: ${body.industry || 'N/A'}\nRole: ${body.role || 'N/A'}\nCompany Size: ${body.companySize || 'N/A'}\nEstimated Budget: ${body.estimatedBudget || 'N/A'}\nTimeline: ${body.timeline || 'N/A'}\nPreferred Start Date: ${body.preferredStartDate || 'N/A'}\nExisting Website: ${body.existingWebsite || 'N/A'}\nProject Description: ${body.projectDescription || 'N/A'}\nProject Goals: ${body.projectGoals || 'N/A'}\nCurrent Challenges: ${body.currentChallenges || 'N/A'}\nRequired Features: ${body.requiredFeatures || 'N/A'}\nSource: ${body.source || 'Website Form'}`,
        html: `
          <h2>New Lead Received</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${body.companyName || 'N/A'}</p>
          <p><strong>Industry:</strong> ${body.industry || 'N/A'}</p>
          <p><strong>Role:</strong> ${body.role || 'N/A'}</p>
          <p><strong>Company Size:</strong> ${body.companySize || 'N/A'}</p>
          <p><strong>Estimated Budget:</strong> ${body.estimatedBudget || 'N/A'}</p>
          <p><strong>Timeline:</strong> ${body.timeline || 'N/A'}</p>
          <p><strong>Preferred Start Date:</strong> ${body.preferredStartDate || 'N/A'}</p>
          <p><strong>Existing Website:</strong> ${body.existingWebsite || 'N/A'}</p>
          <p><strong>Project Description:</strong><br/> ${body.projectDescription || 'N/A'}</p>
          <p><strong>Project Goals:</strong><br/> ${body.projectGoals || 'N/A'}</p>
          <p><strong>Current Challenges:</strong><br/> ${body.currentChallenges || 'N/A'}</p>
          <p><strong>Required Features:</strong><br/> ${body.requiredFeatures || 'N/A'}</p>
          <p><strong>Source:</strong> ${body.source || 'Website Form'}</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      // Send Welcome Email to the User
      const userMailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@pixelsdigitalsolutions.com',
        to: body.email,
        subject: `Thank you for contacting Pixels Digital Solutions!`,
        text: `Hi ${body.name},\n\nThank you for reaching out to us. We have received your project application and our team will get back to you shortly.\n\nHere are the details you provided:\nName: ${body.name}\nEmail: ${body.email}\nPhone: ${body.phone || 'N/A'}\nCompany: ${body.companyName || 'N/A'}\nProject Description: ${body.projectDescription || 'N/A'}\n\nBest regards,\nPixels Digital Solutions Team`,
        html: `
          <h2>Thank you for your application!</h2>
          <p>Hi ${body.name},</p>
          <p>Thank you for reaching out. We have received your project application and our team will review it to see if we're a good fit. We will get back to you shortly.</p>
          <h3>Your Details:</h3>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${body.companyName || 'N/A'}</p>
          <p><strong>Project Description:</strong><br/> ${body.projectDescription || 'N/A'}</p>
          <br/>
          <p>Best regards,<br/><strong>Pixels Digital Solutions Team</strong></p>
        `,
      };

      await transporter.sendMail(userMailOptions);
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
