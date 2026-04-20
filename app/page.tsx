import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { WeatherApp } from './components/WeatherApp';

export default function WeatherPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Weather"
          subtitle="Fetch weather by city and compare a random city below"
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <WeatherApp />
          </div>
        </main>
      </div>
    </div>
  );
}
