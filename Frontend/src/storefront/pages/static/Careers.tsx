import React from 'react';
import { useTheme } from '../../lib/theme';

const Careers: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-600)] py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join Our Team
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Be part of our mission to revolutionize the e-commerce experience
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* No Jobs Available Message */}
          <div className="text-center py-16">
            <div className="bg-[var(--color-surface)] rounded-2xl p-12 shadow-lg border border-[var(--color-border)]">
              {/* Icon */}
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-[var(--color-primary)]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" 
                    />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-ink)] mb-6">
                No Jobs Available Right Now
              </h2>
              
              <p className="text-lg md:text-xl text-[var(--color-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
                We're currently not hiring, but we're always looking for talented individuals to join our team. 
                We'll be uploading new job opportunities soon!
              </p>

              {/* Call to Action */}
              <div className="space-y-4">
                <p className="text-[var(--color-ink-secondary)] font-medium">
                  Stay updated with our latest opportunities
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg">
                    Subscribe to Notifications
                  </button>
                  
                  <button className="border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-ink)] hover:text-[var(--color-primary)] px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                    Follow Us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Culture Preview */}
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] text-center mb-12">
              What We're About
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Innovation */}
              <div className="text-center p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-[var(--color-ink)] mb-3">Innovation</h4>
                <p className="text-[var(--color-muted)]">We're constantly pushing the boundaries of e-commerce technology</p>
              </div>

              {/* Growth */}
              <div className="text-center p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-[var(--color-ink)] mb-3">Growth</h4>
                <p className="text-[var(--color-muted)]">We invest in our team's professional development and career growth</p>
              </div>

              {/* Collaboration */}
              <div className="text-center p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-[var(--color-ink)] mb-3">Collaboration</h4>
                <p className="text-[var(--color-muted)]">We believe in the power of teamwork and diverse perspectives</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-16 text-center">
            <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-border)]">
              <h3 className="text-2xl font-bold text-[var(--color-ink)] mb-4">
                Questions About Future Opportunities?
              </h3>
              <p className="text-[var(--color-muted)] mb-6">
                Feel free to reach out to our HR team for any inquiries about potential future positions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Contact HR Team
                </a>
                <a 
                  href="mailto:careers@electro.com" 
                  className="border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-ink)] hover:text-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
