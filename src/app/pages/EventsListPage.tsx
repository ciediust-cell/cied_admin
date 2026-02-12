import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Calendar, Clock, MapPin } from 'lucide-react';

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Upcoming' | 'Past' | 'Ongoing';
  attendees?: number;
}

const mockEventsData: EventItem[] = [
  {
    id: 1,
    title: 'Annual Day Celebration 2026',
    date: '2026-02-28',
    time: '10:00 AM',
    location: 'Main Auditorium',
    status: 'Upcoming',
    attendees: 500,
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting',
    date: '2026-02-15',
    time: '2:00 PM',
    location: 'Conference Hall',
    status: 'Upcoming',
    attendees: 200,
  },
  {
    id: 3,
    title: 'Science Exhibition',
    date: '2026-02-10',
    time: '9:00 AM',
    location: 'Science Block',
    status: 'Ongoing',
    attendees: 150,
  },
  {
    id: 4,
    title: 'Sports Day 2026',
    date: '2026-02-05',
    time: '8:00 AM',
    location: 'Sports Ground',
    status: 'Past',
    attendees: 600,
  },
  {
    id: 5,
    title: 'Alumni Meet 2026',
    date: '2026-01-30',
    time: '6:00 PM',
    location: 'Main Campus',
    status: 'Past',
    attendees: 300,
  },
  {
    id: 6,
    title: 'Cultural Festival',
    date: '2026-01-25',
    time: '5:00 PM',
    location: 'Open Theater',
    status: 'Past',
    attendees: 450,
  },
  {
    id: 7,
    title: 'Science Fair 2026',
    date: '2026-03-15',
    time: '10:00 AM',
    location: 'Exhibition Hall',
    status: 'Upcoming',
    attendees: 250,
  },
  {
    id: 8,
    title: 'Music Concert',
    date: '2026-03-20',
    time: '6:30 PM',
    location: 'Auditorium',
    status: 'Upcoming',
    attendees: 400,
  },
];

export function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>(mockEventsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Past' | 'Ongoing'>('All');

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/events/${id}/edit`);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      weekday: date.toLocaleString('en-US', { weekday: 'short' }),
    };
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Manage Events</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage events for your institution
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/events/new')}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2">
              {(['All', 'Upcoming', 'Ongoing', 'Past'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-input-background text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-2">No events found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or create a new event
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const dateInfo = formatDate(event.date);
            return (
              <div
                key={event.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex">
                  {/* Date Display */}
                  <div
                    className={`w-24 flex-shrink-0 flex flex-col items-center justify-center text-center border-r border-border ${
                      event.status === 'Upcoming'
                        ? 'bg-blue-50'
                        : event.status === 'Ongoing'
                        ? 'bg-green-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {dateInfo.month}
                    </p>
                    <p className="text-3xl text-foreground my-1">{dateInfo.day}</p>
                    <p className="text-xs text-muted-foreground">{dateInfo.year}</p>
                    <p className="text-xs text-muted-foreground mt-1 uppercase">
                      {dateInfo.weekday}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-foreground mb-2">{event.title}</h3>
                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-xs mb-3 ${
                            event.status === 'Upcoming'
                              ? 'bg-blue-100 text-blue-700'
                              : event.status === 'Ongoing'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {event.status}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(event.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Event Meta Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      {event.attendees && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                          <span>Expected Attendees:</span>
                          <span className="text-foreground">{event.attendees}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {filteredEvents.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Events</p>
              <p className="text-2xl text-foreground">{events.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
              <p className="text-2xl text-blue-600">
                {events.filter((e) => e.status === 'Upcoming').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ongoing</p>
              <p className="text-2xl text-green-600">
                {events.filter((e) => e.status === 'Ongoing').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Past</p>
              <p className="text-2xl text-gray-600">
                {events.filter((e) => e.status === 'Past').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
