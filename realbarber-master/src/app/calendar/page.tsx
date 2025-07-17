import Calendar from '../../components/Calendar';

export default function CalendarPage({ searchParams }: { searchParams?: { date?: string, locationId?: string, key?: string } }) {
  return <Calendar searchParams={searchParams} />;
} 
