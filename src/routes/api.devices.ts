import { createFileRoute } from '@tanstack/react-router';
import { INITIAL_DEVICES } from '@/lib/energy-advisor-research';

export const Route = createFileRoute('/api/devices')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const deviceId = url.searchParams.get('id');

        if (deviceId) {
          const dev = INITIAL_DEVICES.find((d) => d.id === deviceId);
          if (!dev) {
            return new Response(JSON.stringify({ error: 'Device not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ device: dev }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(
          JSON.stringify({
            count: INITIAL_DEVICES.length,
            devices: INITIAL_DEVICES,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const newDevice = {
            id: `dev-${Date.now().toString().slice(-4)}`,
            name: body.name || 'New Device',
            type: body.type || 'Equipment',
            location: body.location || 'Research Lab',
            esp32NodeId: body.esp32NodeId || 'Node 01',
            currentState: 'IDLE',
            currentPowerW: body.ratedPowerW ? Math.round(body.ratedPowerW * 0.2) : 40,
            expectedPowerW: body.ratedPowerW ? Math.round(body.ratedPowerW * 0.2) : 40,
            excessPowerW: 0,
            status: 'NORMAL',
            statusLabel: 'NORMAL',
            temperatureC: 28.0,
            vibrationG: 0.05,
            activityLevel: 'Low',
            voltageV: 230.0,
            currentA: 0.2,
            todayEnergyKWh: 0.0,
            excessEnergyTodayKWh: 0.0,
            energySavedTodayKWh: 0.0,
            lastUpdateSecondsAgo: 0,
            stateModels: [
              { state: 'IDLE', expectedPowerW: 40, toleranceW: 5, sampleCount: 100 },
            ],
            modelMetadata: {
              modelType: 'State-Conditioned Baseline',
              trainingPeriod: 'Initial',
              sampleCount: 100,
              mae: 4.5,
              rmse: 5.8,
              rSquared: 0.92,
            },
          };

          return new Response(JSON.stringify({ success: true, device: newDevice }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message || 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
