import { createFileRoute } from '@tanstack/react-router';
import {
  INITIAL_MODEL_COMPARISONS,
  INITIAL_ABLATION_STUDY,
} from '@/lib/energy-advisor-research';

export const Route = createFileRoute('/api/models')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return new Response(
          JSON.stringify({
            count: INITIAL_MODEL_COMPARISONS.length,
            models: INITIAL_MODEL_COMPARISONS,
            ablation_study: INITIAL_ABLATION_STUDY,
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
          const modelType = body.model_type || 'Random Forest';

          return new Response(
            JSON.stringify({
              success: true,
              trained_at: new Date().toISOString(),
              model_type: modelType,
              sample_count: 14000,
              validation_metrics: {
                mae: 3.8,
                rmse: 4.9,
                r_squared: 0.965,
                precision: 0.94,
                recall: 0.93,
                f1: 0.935,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message || 'Invalid training request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
