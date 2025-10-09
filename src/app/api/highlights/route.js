// app/api/highlights/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all highlights for an article
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const userSession = searchParams.get('userSession');

    if (!articleId || !userSession) {
      return NextResponse.json(
        { error: 'articleId and userSession are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT * FROM highlights 
       WHERE article_id = $1 AND user_session = $2
       ORDER BY created_at ASC`,
      [articleId, userSession]
    );

    return NextResponse.json({
      highlights: result.rows
    });

  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// POST - Create new highlight
export async function POST(request) {
  try {
    const { 
      articleId, 
      userSession, 
      highlightedText, 
      startOffset, 
      endOffset, 
      containerPath,
      color = 'yellow',
      note 
    } = await request.json();

    if (!articleId || !userSession || !highlightedText || startOffset === undefined || endOffset === undefined || !containerPath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO highlights 
       (article_id, user_session, highlighted_text, start_offset, end_offset, container_path, color, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [articleId, userSession, highlightedText, startOffset, endOffset, containerPath, color, note]
    );

    return NextResponse.json({
      success: true,
      highlight: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating highlight:', error);
    
    // Handle duplicate highlights
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Highlight already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create highlight', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete highlight
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const highlightId = searchParams.get('id');
    const userSession = searchParams.get('userSession');

    if (!highlightId || !userSession) {
      return NextResponse.json(
        { error: 'id and userSession are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM highlights 
       WHERE id = $1 AND user_session = $2
       RETURNING *`,
      [highlightId, userSession]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Highlight deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}