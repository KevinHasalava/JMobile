import React from 'react';

const About = () => {
  const stats = [
    { label: 'Products', value: '500+' },
    { label: 'Customers', value: '10,000+' },
    { label: 'Experience', value: '5 Years' },
    { label: 'Support', value: '24/7' },
  ];

  const team = [
    { name: 'Sarah Jenkins', role: 'Founder & CEO', initials: 'SJ' },
    { name: 'David Chen', role: 'Head of Product', initials: 'DC' },
    { name: 'Marcus Row', role: 'Lead Designer', initials: 'MR' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f97316] opacity-5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[#f97316] font-semibold tracking-widest uppercase text-sm mb-4 block">About JM Mobiles</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Where The Future <br/>
            <span className="text-[#f97316]">Meets Tech</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            We are dedicated to bringing you the most advanced, premium mobile technology. Our mission is to seamlessly integrate futuristic designs with everyday functionality, ensuring you stay ahead of the curve.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-[#121212]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-800">
            {stats.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-[#f97316] text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Founded in 2021, JM Mobiles started with a simple vision: to make premium, high-tech mobile accessories accessible to everyone. We noticed a gap in the market where futuristic design was often compromised for durability.
                </p>
                <p>
                  Today, we are proud to serve over 10,000 customers worldwide, offering a curated selection of smartphones, revolutionary anti-gravity cases, and next-gen wearables. We test every product rigorously to ensure it meets our "future-ready" standards.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-full aspect-video rounded-2xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4 bg-[#121212]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mission & Values</h2>
            <p className="text-gray-400">The core principles that drive everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 hover:border-[#f97316]/50 transition-colors">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-xl flex items-center justify-center mb-6 text-[#f97316]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Constantly seeking the next breakthrough in mobile technology to enhance your digital lifestyle.</p>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 hover:border-[#f97316]/50 transition-colors">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-xl flex items-center justify-center mb-6 text-[#f97316]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Rigorous testing and premium materials ensure our products withstand the test of time.</p>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 hover:border-[#f97316]/50 transition-colors">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-xl flex items-center justify-center mb-6 text-[#f97316]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Success</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your satisfaction is our priority. We provide dedicated support to ensure a seamless experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet The Team</h2>
            <p className="text-gray-400">The visionaries behind JM Mobiles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-6 text-3xl font-bold text-gray-600 group-hover:border-[#f97316] group-hover:text-[#f97316] transition-all">
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-[#f97316] text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
