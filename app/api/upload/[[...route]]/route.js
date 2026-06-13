// We are bypassing Cloudinary entirely and using Base64 Data URIs directly.
// This mimics the legacy JMobiles branch behavior on Vercel.

import { NextResponse } from 'next/server';
import { protect, admin as checkAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  const resolvedParams = await params;
  const route = resolvedParams?.route || [];
  const type = route[0]; // product, bank-slip, avatar

  const userReq = await protect(req);
  if (!userReq) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

  if (type === 'product' && !(await checkAdmin(userReq))) {
    return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const files = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value.arrayBuffer) {
        files.push({ key, file: value });
      }
    }

    if (files.length === 0) return NextResponse.json({ success: false, message: 'No files provided' }, { status: 400 });

    const uploadPromises = files.map(async ({ key, file }) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Bypass Cloudinary completely: 
      // Return the raw Base64 string to the frontend exactly like the JMobiles branch.
      return {
        filename: file.name,
        path: dataURI,
        mimetype: file.type,
        size: file.size
      };
    });

    const results = await Promise.all(uploadPromises);

    if (type === 'product') {
       const images = results.filter(r => !r.mimetype.includes('video'));
       const video = results.find(r => r.mimetype.includes('video'));
       return NextResponse.json({ success: true, message: 'Files uploaded successfully', data: { images, video } }, { status: 200 });
    } else {
       return NextResponse.json({ success: true, message: 'File uploaded successfully', data: results[0] }, { status: 200 });
    }

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
