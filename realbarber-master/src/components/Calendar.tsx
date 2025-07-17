"use client";

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar as BigCalendar, dateFnsLocalizer, Event, Views } from 'react-big-calendar';
import { parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from './ui/drawer';
import { DrawerClose } from './ui/drawer';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { useAdmin } from '@/contexts/AdminContext';


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#111]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 border-opacity-80"></div>
    </div>
  );
}

export default function Calendar({ searchParams }: { searchParams?: { date?: string, locationId?: string, key?: string } }) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const { isAdmin, isLoading: isLoadingAdmin } = useAdmin();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any | null>(null);

  // Определяем параметры
  const locationId = searchParams?.locationId || urlParams.get('locationId') || 'modrany';

  const colors = {
    modrany: {
      accent: '#d8232a',
      text: '#ffffff',
    },
    hagibor: {
      accent: '#0090f9',
      text: '#ffffff',
    },
    kacerov: {
      accent: '#FFD700',
      text: '#000000',
    }
  }

  const theme = colors[locationId as keyof typeof colors];

  const eventStyle = {
    backgroundColor: theme.accent,
    color: theme.text,
    borderRadius: '0',
    border: '1px solid #000',
    padding: '2px 5px',
    fontSize: '14px',
    fontWeight: 500,
  };

  const date = searchParams?.date || urlParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  // Tanstack Query для загрузки событий
  const { data, isLoading } = useQuery({
    queryKey: ['calendar-events', locationId, date],
    queryFn: async () => {
      const res = await fetch(`/api/google-calendar?location=${locationId}&date=${date}`);
      const data = await res.json();
      // Преобразуем события и ресурсы
      const events = (data || []).map((event: any) => ({
        id: event.id,
        title: event.summary || 'Bez názvu',
        start: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date),
        end: event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
        description: event.description,
        location: event.location,
        creator: event.creator?.email,
        resourceId: event.calendarId,
        masterName: event.masterName,
      }));
      const resources = Array.from(
        new Map(
          events.map(e => [e.resourceId, { id: e.resourceId, title: e.masterName }])
        ).values()
      ) as { id: string, title: string }[];
      return { events, resources };
    },
    refetchInterval: 10 * 1000, // 10 секунд
  });

  const handleNavigate = (newDate: Date) => {
    const params = new URLSearchParams(urlParams?.toString() || '');
    params.set('date', format(newDate, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  };

  const formats = useMemo(() => ({
    timeGutterFormat: (date: Date, culture: string, localizer: any) =>
      localizer.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture: string, localizer: any) =>
      `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`,
    agendaTimeFormat: (date: Date, culture: string, localizer: any) =>
      localizer.format(date, 'HH:mm', culture),
    dayHeaderFormat: (date: Date) =>
      format(date, 'EEEE d MMMM', { locale: enUS }),
  }), []);

  if (isLoading || !data || isLoadingAdmin) return <Loader />;

  return (
    <div className="h-screen w-screen shadow-2xl bg-[#111]">
      <BigCalendar
        localizer={localizer}
        events={data.events}
        resources={data.resources}
        resourceIdAccessor="id"
        resourceTitleAccessor="title"
        defaultView={Views.DAY}
        views={[Views.DAY]}
        defaultDate={date ? parseISO(date) : new Date()}
        style={{ height: '100%' }}
        startAccessor="start"
        endAccessor="end"
        onNavigate={handleNavigate}
        eventPropGetter={() => ({
          style: eventStyle,
        })}
        onSelectEvent={(event: any) => {
          setDrawerData(event);
          setDrawerOpen(true);
        }}
        messages={{
          today: 'Dnes',
          previous: 'Zpět',
          next: 'Vpřed',
          day: 'Den',
          date: 'Datum',
          time: 'Čas',
          event: 'Záznam',
          noEventsInRange: 'Žádné záznamy',
        }}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 23, 30, 0)}
        className="custom-calendar"
        formats={formats}
      />
      <style jsx global>{`
        .custom-calendar {
          background: #18181b;
          color: white;
          height: 100vh;
        }
        .custom-calendar .rbc-toolbar {
          background: #23232a;
          padding: 12px;
          border-bottom: 1px solid #333;
        }
        .custom-calendar .rbc-toolbar button {
          color: white;
          background: #333;
          border: 1px solid #444;
          padding: 8px 16px;
          font-size: 14px;
        }
        .custom-calendar .rbc-toolbar button:hover {
          background: #444;
        }
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        .custom-calendar .rbc-time-header {
          background: #23232a;
          border-color: #333;
        }
        .custom-calendar .rbc-time-header-content {
          border-color: #333;
        }
        .custom-calendar .rbc-time-content {
          border-color: #333;
        }
        .custom-calendar .rbc-time-slot {
          border-color: #333;
        }
        .custom-calendar .rbc-time-gutter {
          background: #23232a;
          border-color: #333;
          font-size: 12px;
        }
        .custom-calendar .rbc-time-column {
          border-color: #333;
        }
        .custom-calendar .rbc-time-header-gutter {
          background: #23232a;
          border-color: #333;
        }
        .custom-calendar .rbc-header {
          background: #23232a;
          border-color: #333;
          color: white;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
        }
        .custom-calendar .rbc-time-view {
          border-color: #333;
        }
        .custom-calendar .rbc-today {
          background: rgba(59, 130, 246, 0.1);
        }
        .custom-calendar .rbc-event {
          margin: 1px 2px;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 4px;
        }
        .custom-calendar .rbc-event.rbc-selected {
          background-color: inherit;
        }
        .custom-calendar .rbc-event:focus {
          outline: none;
        }
        .custom-calendar .rbc-time-slot.rbc-now {
          background-color: rgba(59, 130, 246, 0.05);
        }
        .custom-calendar .rbc-current-time-indicator {
          background-color: #3b82f6;
          height: 2px;
        }
      `}</style>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {drawerData ? (
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>{drawerData.title}</DrawerTitle>
                {isAdmin && <DrawerDescription>{drawerData.description}</DrawerDescription>}
              </DrawerHeader>
              <div className="p-4 pb-0 pt-0 text-muted-foreground">
                {drawerData.masterName && <div>Barber: {drawerData.masterName}</div>}
                <div>
                  Čas: {format(drawerData.start, 'HH:mm')} – {format(drawerData.end, 'HH:mm')}
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Zavřít</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-sm">
              <span>No data</span>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
} 
