import React, { useState } from 'react';
import { Check, Calendar, MapPin, Users, Send, Sparkles, Copy } from 'lucide-react';

const RSVPApp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attendance, setAttendance] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const events = [
    { id: 'sat-brunch', day: 'Saturday', time: '10:30 AM', name: 'Brunch', location: 'Route Haggerston' },
    { id: 'sat-lunch', day: 'Saturday', time: '1-5 PM', name: 'Lunch', location: 'The Scolts Head' },
    { id: 'sat-dinner', day: 'Saturday', time: '6:00 PM', name: 'Dinner', location: 'Tonkotsu East' },
    { id: 'sun-church', day: 'Sunday', time: '11:30 AM', name: 'Morning Service', location: 'Saint Hackney' },
    { id: 'sun-lunch', day: 'Sunday', time: '2-6 PM', name: 'Lunch', location: 'Spitalfields Market' },
    { id: 'sun-movie', day: 'Sunday', time: '6/7:30 PM', name: 'Movie Night', location: 'TBD' }
  ];

  const toggleEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleAttendanceChange = (value) => {
    setAttendance(value);
    if (value === 'all') {
      setSelectedEvents(events.map(e => e.id));
    } else if (value === 'none') {
      setSelectedEvents([]);
    }
  };

  const generateRSVPText = () => {
    const eventNames = selectedEvents.map(id => {
      const event = events.find(e => e.id === id);
      return event ? `${event.day} ${event.time}: ${event.name}` : '';
    }).filter(Boolean).join('\n');

    return `
🎉 RSVP for Cribbins London Weekend 🎉

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Attending: ${
  attendance === 'all' ? '✅ All Weekend!' : 
  attendance === 'partial' ? '📅 Selected Events' : 
  '😢 Unable to Attend'
}

${attendance !== 'none' && selectedEvents.length > 0 ? `Events:\n${eventNames}\n` : ''}
${dietaryRestrictions ? `\nDietary: ${dietaryRestrictions}` : ''}
${notes ? `\nNotes: ${notes}` : ''}

Sent: ${new Date().toLocaleString()}
    `.trim();
  };

  const handleCopyRSVP = () => {
    const rsvpText = generateRSVPText();
    navigator.clipboard.writeText(rsvpText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = () => {
    if (!name || !email || !attendance) {
      alert('Please fill in all required fields!');
      return;
    }
    
    const rsvpData = {
      name,
      email,
      phone,
      attendance,
      selectedEvents,
      dietaryRestrictions,
      notes,
      timestamp: new Date().toISOString()
    };
    
    console.log('RSVP Submitted:', rsvpData);
    
    // Copy to clipboard
    const rsvpText = generateRSVPText();
    navigator.clipboard.writeText(rsvpText);
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">RSVP Saved!</h2>
          <p className="text-gray-600 mb-6">
            Thanks for letting us know, {name}! Your RSVP has been copied to your clipboard.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 font-semibold mb-2">Next Step:</p>
            <p className="text-sm text-gray-600">
              Please send your RSVP via WhatsApp, Instagram DM, or text message to the organizers!
            </p>
          </div>
          
          <button 
            onClick={() => {
              const rsvpText = generateRSVPText();
              navigator.clipboard.writeText(rsvpText);
              alert('RSVP copied to clipboard again!');
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors mb-4 w-full"
          >
            Copy RSVP Again
          </button>
          
          <button 
            onClick={() => {
              setSubmitted(false);
              setName('');
              setEmail('');
              setPhone('');
              setAttendance('');
              setSelectedEvents([]);
              setDietaryRestrictions('');
              setNotes('');
            }}
            className="text-purple-600 hover:text-purple-700 transition-colors"
          >
            Submit Another RSVP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8 pt-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-2">Cribbins</h1>
          <p className="text-2xl mb-4">London Weekend</p>
          <div className="inline-block bg-white/20 backdrop-blur rounded-full px-6 py-3 mb-4">
            <p className="text-xl font-semibold">October 25-26</p>
          </div>
          <p className="text-lg">🎉 Celebrating Niyati & Chad's Birthdays 🎂</p>
          <p className="text-sm mt-2">(Chad's Big 5-0!)</p>
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            RSVP
          </h2>

          {/* Basic Info */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
          </div>

          {/* Attendance Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              I'll be attending... *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAttendanceChange('all')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  attendance === 'all' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">All Weekend! 🎉</div>
                <div className="text-sm mt-1">Count me in for everything</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleAttendanceChange('partial')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  attendance === 'partial' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Some Events 📅</div>
                <div className="text-sm mt-1">I'll pick below</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleAttendanceChange('none')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  attendance === 'none' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Can't Make It 😢</div>
                <div className="text-sm mt-1">Next time!</div>
              </button>
            </div>
          </div>

          {/* Event Selection */}
          {attendance === 'partial' && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Events You'll Attend
              </label>
              <div className="space-y-3">
                {['Saturday', 'Sunday'].map(day => (
                  <div key={day}>
                    <div className="font-semibold text-gray-600 mb-2">{day}</div>
                    {events.filter(e => e.day === day).map(event => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => toggleEvent(event.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 mb-2 transition-all ${
                          selectedEvents.includes(event.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{event.time}</span>
                            </div>
                            <div className="font-semibold text-gray-800 mt-1">{event.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{event.location}</span>
                            </div>
                          </div>
                          {selectedEvents.includes(event.id) && (
                            <Check className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          {attendance !== 'none' && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Restrictions or Allergies
              </label>
              <input
                type="text"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Vegetarian, nut allergy, etc."
              />
            </div>
          )}

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Any Notes or Special Requests?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
              placeholder="Bringing a plus one? Let us know!"
            />
          </div>

          {/* Preview Section */}
          {name && email && attendance && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Preview Your RSVP</span>
                <button
                  onClick={handleCopyRSVP}
                  className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                {generateRSVPText()}
              </pre>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!name || !email || !attendance}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Send className="w-5 h-5" />
            Generate & Copy RSVP
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            This will copy your RSVP to clipboard for you to send via WhatsApp, text, or DM
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-white mt-8 pb-8">
          <p className="text-sm opacity-80">
            Questions? Drop us a message! 💬
          </p>
        </div>
      </div>
    </div>
  );
};

export default RSVPApp;