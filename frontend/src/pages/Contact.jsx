import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post(
        '/contact',
        formData
      );
      if (response.data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message sent successfully!');
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-[#1a1a1a] border ${
      errors[field] ? 'border-red-500' : 'border-gray-700 focus:border-[#FF8C00]'
    } rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder-gray-600`;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white py-20 px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF8C00] opacity-[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF8C00] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <span className="inline-block bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question about our products, an order, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Contact Form */}
          <div className="lg:col-span-3 bg-[#121212] p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

            {isSubmitted ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl flex items-center gap-4 animate-fadeIn">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Message Sent!</p>
                  <p className="text-sm text-gray-400">
                    Thank you! We've received your inquiry and will get back to you shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Full Name <span className="text-[#FF8C00]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass('name')}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Email Address <span className="text-[#FF8C00]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass('email')}
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Subject <span className="text-[#FF8C00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClass('subject')}
                    placeholder="How can we help?"
                    disabled={isSubmitting}
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1.5">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Message <span className="text-[#FF8C00]">*</span>
                  </label>
                  <textarea
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClass('message')} resize-none`}
                    placeholder="Tell us more about your inquiry..."
                    disabled={isSubmitting}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8C00] to-[#FF7A00] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-[0_8px_24px_rgba(255,140,0,0.4)] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ transform: isSubmitting ? 'none' : undefined }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info Cards */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-5">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                ),
                title: 'Our Location',
                lines: ['123 Tech Avenue, Suite 400', 'Silicon Valley, CA 94025'],
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
                title: 'Email Us',
                lines: ['support@jmmobiles.com', 'sales@jmmobiles.com'],
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                ),
                title: 'Call Us',
                lines: ['+1 (800) 123-4567', 'Mon–Fri  8am – 6pm PST'],
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Business Hours',
                lines: ['Monday – Friday: 9am – 7pm', 'Saturday: 10am – 5pm'],
              },
            ].map(({ icon, title, lines }) => (
              <div
                key={title}
                className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex items-start gap-4 hover:border-[#FF8C00]/40 transition-colors group"
              >
                <div className="w-11 h-11 bg-[#FF8C00]/10 rounded-xl flex items-center justify-center text-[#FF8C00] flex-shrink-0 group-hover:bg-[#FF8C00]/20 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">{title}</h3>
                  {lines.map((line, i) => (
                    <p key={i} className="text-gray-400 text-sm leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
