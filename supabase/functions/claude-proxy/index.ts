import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    serve(async (req) => {
      if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
        try {
            const body = await req.json();
                const r = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                              headers: {
                                      'Content-Type': 'application/json',
                                              'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
                                                      'anthropic-version': '2023-06-01',
                                                            },
                                                                  body: JSON.stringify(body),
                                                                      });
                                                                          const data = await r.json();
                                                                              return new Response(JSON.stringify(data), {
                                                                                    headers: { ...cors, 'Content-Type': 'application/json' },
                                                                                          status: r.status,
                                                                                              });
                                                                                                } catch (e) {
                                                                                                    return new Response(JSON.stringify({ error: e.message }), {
                                                                                                          headers: { ...cors, 'Content-Type': 'application/json' },
                                                                                                                status: 500,
                                                                                                                    });
                                                                                                                      }
                                                                                                                      });
                                                                                                                      
                }