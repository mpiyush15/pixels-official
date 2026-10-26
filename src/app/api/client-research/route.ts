import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { DEFAULT_RESEARCH_QUESTIONS } from '@/lib/constants/researchQuestions';

// GET all client research sessions
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (clientId) {
      filter.clientId = clientId;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const researches = await db
      .collection('client_researches')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(researches);
  } catch (error) {
    console.error('Error fetching client research records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client research records' },
      { status: 500 }
    );
  }
}

// POST create new client research session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const { clientId, title, reportType = 'questions', uploadedReport } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client selection is required' },
        { status: 400 }
      );
    }

    // Lookup client details
    let client: any = null;
    try {
      client = await db.collection('clients').findOne({ _id: new ObjectId(clientId) });
    } catch {
      client = await db.collection('clients').findOne({ _id: clientId });
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found in directory' },
        { status: 404 }
      );
    }

    // Initialize default questions
    const initializedQuestions = DEFAULT_RESEARCH_QUESTIONS.map(q => ({
      id: q.id,
      category: q.category,
      categoryLabel: q.categoryLabel,
      question: q.question,
      answer: '',
      notes: '',
      isCustom: false,
    }));

    const newResearch = {
      clientId: client._id.toString(),
      clientName: client.name || 'Valued Client',
      companyName: client.company || client.name || 'Client Business',
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
      industry: client.industry || 'Digital & Technology',
      title: title || `Market Discovery & Research - ${client.company || client.name}`,
      status: 'draft', // draft | in_progress | finalized | sent_to_client | converted
      reportType, // 'questions' | 'manual_upload' | 'both'
      
      uploadedReport: uploadedReport || null,
      
      questions: initializedQuestions,
      
      marketAnalysis: {
        targetAudienceSummary: '',
        competitors: [
          { name: '', website: '', strengths: '', weaknesses: '' }
        ],
        marketOpportunities: '',
        risksAndChallenges: '',
      },
      
      recommendations: {
        suggestedScope: '',
        recommendedTechStack: ['Next.js', 'React', 'Node.js', 'Tailwind CSS', 'AWS S3', 'MongoDB'],
        suggestedMilestones: [
          { name: 'Phase 1: Architecture, Wireframes & UX Design', description: 'Interactive prototypes, moodboards, and approved visual identity.', targetWeeks: 'Week 1-2', amount: 0 },
          { name: 'Phase 2: Core Engineering & Integrations', description: 'Frontend components, backend database schemas, and API connectors.', targetWeeks: 'Week 3-5', amount: 0 },
          { name: 'Phase 3: QA, Performance Audit & Launch', description: 'End-to-end testing, SEO indexing, and production deployment.', targetWeeks: 'Week 6', amount: 0 }
        ],
        estimatedBudget: 0,
        targetLaunchDate: '',
      },
      
      executiveSummary: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('client_researches').insertOne(newResearch);

    return NextResponse.json({
      success: true,
      researchId: result.insertedId,
      research: { ...newResearch, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating client research record:', error);
    return NextResponse.json(
      { error: 'Failed to create client research session' },
      { status: 500 }
    );
  }
}
