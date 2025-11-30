import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// API route to create dummy data for testing
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Create dummy client for web dev project
    const webDevClient = {
      name: 'Tech Startup Inc',
      email: 'client@techstartup.com',
      phone: '+91-9876543210',
      company: 'Tech Startup Inc',
      industry: 'Technology',
      address: '123 Tech Park, Bangalore, Karnataka 560001',
      status: 'active',
      totalRevenue: 60000,
      projectsCount: 1,
      portalAccessEnabled: true,
      password: await bcrypt.hash('demo123', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const webClientResult = await db.collection('clients').insertOne(webDevClient);
    const webClientId = webClientResult.insertedId.toString();

    // Create web development project with phases
    const webDevProject = {
      clientId: webClientId,
      name: 'E-commerce Website Development',
      type: 'E-commerce Development',
      description: 'Complete e-commerce platform with payment gateway integration, product management, and customer portal',
      status: 'in-progress',
      progress: 35,
      budget: 60000,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-02-28'),
      milestones: [
        {
          name: 'Project Kickoff',
          status: 'completed',
          dueDate: new Date('2024-11-05'),
        },
        {
          name: 'Beta Launch',
          status: 'pending',
          dueDate: new Date('2025-01-31'),
        },
        {
          name: 'Final Delivery',
          status: 'pending',
          dueDate: new Date('2025-02-28'),
        },
      ],
      phases: [
        {
          _id: 'phase-1-design',
          name: 'Design & Wireframes',
          description: 'UI/UX design, wireframes, mockups, and design system creation',
          amount: 15000,
          status: 'completed',
          progress: 100,
          paymentStatus: 'paid',
          invoiceId: null, // Will be set later
          dailyUpdates: [
            {
              _id: 'update-1',
              description: 'Created initial wireframes for homepage, product listing, and checkout pages',
              date: '2024-11-10',
              timestamp: new Date('2024-11-10'),
            },
            {
              _id: 'update-2',
              description: 'Finalized color scheme and typography based on brand guidelines',
              date: '2024-11-15',
              timestamp: new Date('2024-11-15'),
            },
            {
              _id: 'update-3',
              description: 'Completed high-fidelity mockups for all main pages. Client approved designs.',
              date: '2024-11-20',
              timestamp: new Date('2024-11-20'),
            },
          ],
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-20'),
        },
        {
          _id: 'phase-2-development',
          name: 'Frontend & Backend Development',
          description: 'Build complete e-commerce platform with product catalog, cart, checkout, and admin panel',
          amount: 35000,
          status: 'in-progress',
          progress: 45,
          paymentStatus: 'unpaid',
          invoiceId: null,
          dailyUpdates: [
            {
              _id: 'update-4',
              description: 'Set up Next.js project structure and database schema',
              date: '2024-11-25',
              timestamp: new Date('2024-11-25'),
            },
            {
              _id: 'update-5',
              description: 'Implemented product listing page with filters and search functionality',
              date: '2024-11-28',
              timestamp: new Date('2024-11-28'),
            },
            {
              _id: 'update-6',
              description: 'Working on shopping cart and checkout flow integration',
              date: '2024-11-30',
              timestamp: new Date('2024-11-30'),
            },
          ],
          createdAt: new Date('2024-11-21'),
          updatedAt: new Date('2024-11-30'),
        },
        {
          _id: 'phase-3-testing',
          name: 'Testing & Deployment',
          description: 'QA testing, bug fixes, performance optimization, and production deployment',
          amount: 10000,
          status: 'locked',
          progress: 0,
          paymentStatus: 'unpaid',
          invoiceId: null,
          dailyUpdates: [],
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-01'),
        },
      ],
      videos: [],
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-30'),
    };

    const webProjectResult = await db.collection('projects').insertOne(webDevProject);

    // Create invoice and payment for Phase 1 (Design)
    const designInvoice = {
      invoiceNumber: 'INV-1001',
      clientId: webClientId,
      projectId: webProjectResult.insertedId.toString(),
      phaseId: 'phase-1-design',
      items: [
        {
          description: 'E-commerce Website Development - Design & Wireframes',
          quantity: 1,
          rate: 15000,
          amount: 15000,
        },
      ],
      subtotal: 15000,
      tax: 0,
      total: 15000,
      status: 'paid',
      issueDate: new Date('2024-11-01'),
      dueDate: new Date('2024-11-10'),
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-10'),
    };

    const designInvoiceResult = await db.collection('invoices').insertOne(designInvoice);

    const designPayment = {
      invoiceId: designInvoiceResult.insertedId.toString(),
      clientId: webClientId,
      projectId: webProjectResult.insertedId.toString(),
      phaseId: 'phase-1-design',
      amount: 15000,
      paymentMethod: 'Online',
      paymentDate: new Date('2024-11-10'),
      status: 'completed',
      createdAt: new Date('2024-11-10'),
    };

    await db.collection('payments').insertOne(designPayment);

    // Update phase 1 with invoice ID
    await db.collection('projects').updateOne(
      {
        _id: webProjectResult.insertedId,
        'phases._id': 'phase-1-design',
      },
      {
        $set: {
          'phases.$.invoiceId': designInvoiceResult.insertedId.toString(),
        },
      }
    );

    // ==========================================
    // VIDEO CONTENT PROJECT
    // ==========================================

    // Create dummy client for video content project
    const videoClient = {
      name: 'Fashion Brand Co',
      email: 'client@fashionbrand.com',
      phone: '+91-9876543211',
      company: 'Fashion Brand Co',
      industry: 'Fashion & Retail',
      address: '456 Fashion Street, Mumbai, Maharashtra 400001',
      status: 'active',
      totalRevenue: 12000,
      projectsCount: 1,
      portalAccessEnabled: true,
      password: await bcrypt.hash('demo456', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const videoClientResult = await db.collection('clients').insertOne(videoClient);
    const videoClientId = videoClientResult.insertedId.toString();

    // Create video content project
    const videoProject = {
      clientId: videoClientId,
      name: 'Social Media Video Content Series',
      type: 'Video Production',
      description: 'Monthly social media video content including product showcases, behind-the-scenes, and tutorial videos',
      status: 'in-progress',
      progress: 33,
      budget: 21000,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-01-31'),
      milestones: [],
      phases: [],
      videos: [
        {
          _id: 'video-1',
          title: 'Product Launch Teaser - Winter Collection',
          description: '30-second product launch teaser video featuring the new winter collection',
          driveLink: 'https://drive.google.com/file/d/1mOVS0gLEeEZfUPgAaihGONKU82yXRJUL/view',
          amount: 5000,
          status: 'completed',
          paymentStatus: 'paid',
          invoiceId: null, // Will be set later
          completedDate: new Date('2024-11-15'),
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-15'),
        },
        {
          _id: 'video-2',
          title: 'How to Style Guide - Winter Jackets',
          description: '2-minute styling tutorial showing different ways to wear winter jackets',
          driveLink: '',
          amount: 7000,
          status: 'in-progress',
          paymentStatus: 'unpaid',
          invoiceId: null,
          completedDate: null,
          createdAt: new Date('2024-11-16'),
          updatedAt: new Date('2024-11-30'),
        },
        {
          _id: 'video-3',
          title: 'Behind the Scenes - Photoshoot Day',
          description: '1-minute BTS video from the winter collection photoshoot',
          driveLink: '',
          amount: 4000,
          status: 'pending',
          paymentStatus: 'unpaid',
          invoiceId: null,
          completedDate: null,
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-01'),
        },
        {
          _id: 'video-4',
          title: 'Customer Testimonials Compilation',
          description: '45-second compilation of customer reviews and testimonials',
          driveLink: '',
          amount: 5000,
          status: 'pending',
          paymentStatus: 'unpaid',
          invoiceId: null,
          completedDate: null,
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2024-11-01'),
        },
      ],
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-30'),
    };

    const videoProjectResult = await db.collection('projects').insertOne(videoProject);

    // Create invoice and payment for Video 1
    const video1Invoice = {
      invoiceNumber: 'INV-1002',
      clientId: videoClientId,
      projectId: videoProjectResult.insertedId.toString(),
      videoId: 'video-1',
      items: [
        {
          description: 'Social Media Video Content Series - Product Launch Teaser - Winter Collection',
          quantity: 1,
          rate: 5000,
          amount: 5000,
        },
      ],
      subtotal: 5000,
      tax: 0,
      total: 5000,
      status: 'paid',
      issueDate: new Date('2024-11-10'),
      dueDate: new Date('2024-11-15'),
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-15'),
    };

    const video1InvoiceResult = await db.collection('invoices').insertOne(video1Invoice);

    const video1Payment = {
      invoiceId: video1InvoiceResult.insertedId.toString(),
      clientId: videoClientId,
      projectId: videoProjectResult.insertedId.toString(),
      videoId: 'video-1',
      amount: 5000,
      paymentMethod: 'Online',
      paymentDate: new Date('2024-11-15'),
      status: 'completed',
      createdAt: new Date('2024-11-15'),
    };

    await db.collection('payments').insertOne(video1Payment);

    // Update video 1 with invoice ID
    await db.collection('projects').updateOne(
      {
        _id: videoProjectResult.insertedId,
        'videos._id': 'video-1',
      },
      {
        $set: {
          'videos.$.invoiceId': video1InvoiceResult.insertedId.toString(),
        },
      }
    );

    // Update client revenue
    await db.collection('clients').updateOne(
      { _id: webClientResult.insertedId },
      { $set: { totalRevenue: 15000 } }
    );

    await db.collection('clients').updateOne(
      { _id: videoClientResult.insertedId },
      { $set: { totalRevenue: 5000 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Dummy data created successfully',
      data: {
        webDevClient: {
          id: webClientId,
          email: 'client@techstartup.com',
          password: 'demo123',
        },
        videoClient: {
          id: videoClientId,
          email: 'client@fashionbrand.com',
          password: 'demo456',
        },
        projects: {
          webDev: webProjectResult.insertedId.toString(),
          video: videoProjectResult.insertedId.toString(),
        },
      },
    });
  } catch (error) {
    console.error('Error creating dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to create dummy data' },
      { status: 500 }
    );
  }
}
