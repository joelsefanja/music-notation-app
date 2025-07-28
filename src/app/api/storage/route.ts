
import { NextRequest, NextResponse } from 'next/server';
import { FileSystemStorageAdapter } from '../../../services/storage/storage-adapter';

// Create server-side storage adapter instance
const fileSystemStorage = new FileSystemStorageAdapter();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const operation = searchParams.get('operation') || 'read';

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    switch (operation) {
      case 'read':
        const content = await fileSystemStorage.read(filePath);
        return NextResponse.json({ content });

      case 'exists':
        const exists = await fileSystemStorage.exists(filePath);
        return NextResponse.json({ exists });

      case 'list':
        const files = await fileSystemStorage.list(filePath);
        return NextResponse.json({ files });

      case 'stats':
        const stats = await fileSystemStorage.getStats(filePath);
        return NextResponse.json({ stats });

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in storage API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, content, operation = 'write' } = body;

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    switch (operation) {
      case 'write':
        if (content === undefined) {
          return NextResponse.json({ error: 'Content is required for write operation' }, { status: 400 });
        }
        await fileSystemStorage.write(filePath, content);
        return NextResponse.json({ message: 'File written successfully' });

      case 'createDirectory':
        await fileSystemStorage.createDirectory(filePath);
        return NextResponse.json({ message: 'Directory created successfully' });

      case 'copy':
        const { destinationPath } = body;
        if (!destinationPath) {
          return NextResponse.json({ error: 'Destination path is required for copy operation' }, { status: 400 });
        }
        await fileSystemStorage.copy(filePath, destinationPath);
        return NextResponse.json({ message: 'File copied successfully' });

      case 'move':
        const { destinationPath: moveDest } = body;
        if (!moveDest) {
          return NextResponse.json({ error: 'Destination path is required for move operation' }, { status: 400 });
        }
        await fileSystemStorage.move(filePath, moveDest);
        return NextResponse.json({ message: 'File moved successfully' });

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in storage API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    await fileSystemStorage.delete(filePath);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error in storage API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
