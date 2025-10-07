// app/api/last-read/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get last read position for an article
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
      `SELECT * FROM last_read_positions 
       WHERE article_id = $1 AND user_session = $2`,
      [articleId, userSession]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        position: null
      });
    }

    return NextResponse.json({
      position: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching last read position:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last read position' },
      { status: 500 }
    );
  }
}

// POST - Save last read position
export async function POST(request) {
  try {
    const { articleId, userSession, scrollPosition, sectionId } = await request.json();

    if (!articleId || !userSession) {
      return NextResponse.json(
        { error: 'articleId and userSession are required' },
        { status: 400 }
      );
    }

    // Upsert (insert or update)
    const result = await query(
      `INSERT INTO last_read_positions 
       (article_id, user_session, scroll_position, section_id, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (article_id, user_session)
       DO UPDATE SET 
         scroll_position = $3,
         section_id = $4,
         updated_at = NOW()
       RETURNING *`,
      [articleId, userSession, scrollPosition || 0, sectionId || null]
    );

    return NextResponse.json({
      success: true,
      position: result.rows[0]
    });

  } catch (error) {
    console.error('Error saving last read position:', error);
    return NextResponse.json(
      { error: 'Failed to save last read position' },
      { status: 500 }
    );
  }
}

// DELETE - Clear last read position
export async function DELETE(request) {
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

    await query(
      `DELETE FROM last_read_positions 
       WHERE article_id = $1 AND user_session = $2`,
      [articleId, userSession]
    );

    return NextResponse.json({
      success: true,
      message: 'Last read position cleared'
    });

  } catch (error) {
    console.error('Error clearing last read position:', error);
    return NextResponse.json(
      { error: 'Failed to clear last read position' },
      { status: 500 }
    );
  }
}