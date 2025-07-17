"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const colors = {
  modrany: {
    accent: '#D8232A',
    text: '#ffffff',
  },
  hagibor: {
    accent: '#0090F9',
    text: '#ffffff',
  },
  kacerov: {
    accent: '#FFD700',
    text: '#000000',
  }
}

const locations = [
  { id: 'modrany', name: 'Modřany', color: colors.modrany },
  { id: 'hagibor', name: 'Hagibor', color: colors.hagibor },
  { id: 'kacerov', name: 'Kačerov', color: colors.kacerov },
];

export default function LocationSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLocationId = searchParams.get('locationId');
  const currentDate = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const savedVisibility = localStorage.getItem('locationSelectorVisible');
    if (savedVisibility !== null) {
      setIsVisible(savedVisibility === 'true');
    }
  }, []);

  const handleLocationChange = (locationId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('locationId', locationId);
    router.push(`?${params.toString()}`);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (typeof window !== 'undefined' && date) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('date', format(date, 'yyyy-MM-dd'));
      window.location.href = currentUrl.toString();
    }
  };

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    localStorage.setItem('locationSelectorVisible', newVisibility.toString());
  };

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 bg-zinc-900 p-2 rounded-lg shadow-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
        title="Show Location Selector"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-zinc-400">Vyberte pobočku</h3>
          <button
            onClick={toggleVisibility}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
            title="Skrýt výběr pobočky"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => {
              const isActive = currentLocationId === location.id;
              return (
                <button
                  key={location.id}
                  onClick={() => handleLocationChange(location.id)}
                  style={{
                    backgroundColor: isActive ? location.color.accent : 'transparent',
                    color: isActive ? location.color.text : '#ffffff',
                    border: `2px solid ${location.color.accent}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = `${location.color.accent}20`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {location.name}
                </button>
              );
            })}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !currentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDate ? format(currentDate, "PPP", { locale: cs }) : <span>Vyberte datum</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateChange}
                initialFocus
                locale={cs}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
} 