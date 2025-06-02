import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Simulate sending an email by logging the data to the console
    console.log('Received contact form submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);

    // --- TODO: Implement actual email sending logic here ---
    // For example, using a service like SendGrid, Resend, or Nodemailer.
    // This would typically involve:
    // 1. Importing the email library.
    // 2. Configuring it with API keys/credentials (use environment variables).
    // 3. Constructing the email payload (to, from, subject, html/text body).
    // 4. Calling the email sending function.
    // Example (conceptual):
    // try {
    //   await sendEmail({
    //     to: process.env.CONTACT_EMAIL_RECIPIENT,
    //     from: 'noreply@yourdomain.com', // Or use the sender's email if your service allows
    //     replyTo: email,
    //     subject: `New Contact Form Submission: ${subject}`,
    //     html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    //   });
    // } catch (emailError) {
    //   console.error('Email sending failed:', emailError);
    //   return NextResponse.json({ message: 'Error sending message. Please try again later.' }, { status: 500 });
    // }
    // --- End of TODO ---

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    // Check if the error is due to JSON parsing
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body: Could not parse JSON.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
