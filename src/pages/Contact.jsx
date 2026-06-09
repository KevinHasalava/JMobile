import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitted(true);
      setErrors({});
      // Mock submit
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316] opacity-5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question about our products, an order, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Contact Form */}
          <div className="bg-[#121212] p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl flex items-center gap-4 animate-fadeIn">
                <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Thank you! Your message has been sent successfully. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border ${errors.name ? 'border-red-500' : 'border-gray-700 focus:border-[#f97316]'} rounded-xl px-4 py-3 text-white outline-none transition-colors`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border ${errors.email ? 'border-red-500' : 'border-gray-700 focus:border-[#f97316]'} rounded-xl px-4 py-3 text-white outline-none transition-colors`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border ${errors.subject ? 'border-red-500' : 'border-gray-700 focus:border-[#f97316]'} rounded-xl px-4 py-3 text-white outline-none transition-colors`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Message</label>
                  <textarea
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border ${errors.message ? 'border-red-500' : 'border-gray-700 focus:border-[#f97316]'} rounded-xl px-4 py-3 text-white outline-none transition-colors resize-none`}
                    placeholder="Your message here..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f97316] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#ea580c] transition-colors mt-2 shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right: Info Cards */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center text-[#f97316] flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Our Location</h3>
                <p className="text-gray-400 leading-relaxed">123 Tech Avenue, Suite 400<br/>Silicon Valley, CA 94025</p>
              </div>
            </div>

            <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center text-[#f97316] flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Email Us</h3>
                <p className="text-gray-400">support@jmmobiles.com</p>
                <p className="text-gray-400">sales@jmmobiles.com</p>
              </div>
            </div>

            <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center text-[#f97316] flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Call Us</h3>
                <p className="text-gray-400">+1 (800) 123-4567</p>
                <p className="text-sm text-gray-500 mt-1">Mon-Fri from 8am to 6pm PST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
