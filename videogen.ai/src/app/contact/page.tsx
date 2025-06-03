'use client';

import { useState, FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [responseMessage, setResponseMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setResponseMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setResponseMessage(result.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
      } else {
        setStatus('error');
        setResponseMessage(result.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('An unexpected error occurred. Please check your connection and try again.');
      console.error('Contact form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 opacity-0 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-heading text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-neutral-darker max-w-2xl mx-auto">
            We're here to help and answer any question you might have. We look forward to hearing from you! Please fill out the form below, or use one of the alternative methods to get in touch.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg space-y-6 border border-neutral-lighter">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-darkest">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-neutral-lighter rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-darkest">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-neutral-lighter rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-darkest">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-neutral-lighter rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-darkest">Message</label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-neutral-lighter rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors duration-300"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {responseMessage && (
              <p className={`text-sm text-center ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {responseMessage}
              </p>
            )}
          </form>

          {/* Alternative Contact Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-lighter">
              <h2 className="text-xl font-heading text-neutral-darkest mb-3">Our Details</h2>
              <div className="space-y-2 text-sm text-neutral-darker">
                <p>
                  <strong>Email:</strong> <a href="mailto:contact@videogen.ai" className="text-primary hover:underline">contact@videogen.ai</a>
                  <br />
                  <span className="text-xs text-neutral-DEFAULT">(User to replace with actual email)</span>
                </p>
                <p>
                  <strong>Business Hours:</strong>
                  <br />
                  Monday - Friday: 9:00 AM - 5:00 PM (EST)
                  <br />
                  <span className="text-xs text-neutral-DEFAULT">(User to update as needed)</span>
                </p>
                {/* <p>
                  <strong>Address:</strong>
                  <br />
                  123 AI Street, Innovation City, CA 90210
                  <br />
                  <span className="text-xs text-neutral-DEFAULT">(User to update if applicable)</span>
                </p> */}
              </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-lighter">
              <h2 className="text-xl font-heading text-neutral-darkest mb-3">Response Time</h2>
                <p className="text-sm text-neutral-darker">
                We typically respond to inquiries within 1-2 business days. For urgent matters, please indicate so in your subject line.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
