import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendProjectResearchReportEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const db = await getDatabase();

    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const research = await db.collection('client_researches').findOne(query);

    if (!research) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      );
    }

    // Determine recipient email (override from body or from research)
    const toEmail = body.to || research.clientEmail;
    if (!toEmail) {
      return NextResponse.json(
        { error: 'Client email is required to send report' },
        { status: 400 }
      );
    }

    // Determine host origin for link
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://pixelsdigitalsolutions.com';
    const reportUrl = `${origin}/admin/client-research/${id}/report`;
    const downloadUrl = research.uploadedReport?.fileUrl || undefined;
    const executiveSummary = body.customMessage || research.executiveSummary || 'Our team has completed the discovery phase and synthesized strategic recommendations, competitor benchmarks, and functional scope.';

    console.log(`📧 Sending Project Research Report via ZeptoMail to: ${toEmail}`);

    const emailResult = await sendProjectResearchReportEmail(
      toEmail,
      research.clientName || 'Valued Client',
      research.companyName || 'Your Business',
      research.title || 'Project Research & Market Discovery Report',
      reportUrl,
      downloadUrl,
      executiveSummary
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to dispatch email via ZeptoMail' },
        { status: 500 }
      );
    }

    // Update research record with sent details
    const emailDeliveryData = {
      sentTo: toEmail,
      sentAt: new Date(),
      subject: `📊 Project Research & Discovery Report: ${research.companyName} - Pixels Digital`,
      messageId: emailResult.messageId || 'sent',
      provider: 'zeptomail' as const,
    };

    await db.collection('client_researches').updateOne(
      query,
      {
        $set: {
          status: 'sent_to_client',
          emailDelivery: emailDeliveryData,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully to client via ZeptoMail',
      emailDelivery: emailDeliveryData,
    });
  } catch (error: any) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
