import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { CALCULATORS } from '../data/calculators';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !openaiApiKey) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
const openai = new OpenAI({ apiKey: openaiApiKey });

async function main() {
  const rows = [];
  for (const item of CALCULATORS) {
    const text = [
      `계산기명: ${item.calculator_name}`,
      `카테고리: ${item.category}`,
      `주요 설명: ${item.main_description}`,
      `입력 항목: ${item.input_items}`,
      `제공 결과: ${item.output_items}`,
      `추천 사용자: ${item.recommended_users}`,
      `활용 가능한 콘텐츠 주제: ${item.content_topics}`,
      `페이지 경로 또는 출처: ${item.page_path}`,
    ].join('\n');

    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const vector = embedding.data[0]?.embedding;
    if (!vector || vector.length !== 1536) {
      throw new Error(`embedding dimension mismatch for ${item.calculator_name}`);
    }

    rows.push({
      ...item,
      source: `세모계 ${item.page_path}`,
      embedding: vector,
    });
  }

  const { error } = await supabase.from('calculators').upsert(rows, {
    onConflict: 'page_path',
  });

  if (error) throw error;
  console.log(`Inserted/updated ${rows.length} calculators`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
