// app/api/test-drive/route.js

export async function GET() {
  try {
    // Example: Return dummy files or use Google Drive API
    const files = [{ id: '1', name: 'test.pdf' }]; // Replace with actual Drive call
    return Response.json({ files });
  } catch (error) {
    console.error('Drive error:', error);
    return new Response('Error fetching drive files', { status: 500 });
  }
}
