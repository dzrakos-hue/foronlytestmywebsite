
CREATE TABLE public.cars (
  id text PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  price bigint NOT NULL,
  year int NOT NULL,
  category text NOT NULL,
  short_desc text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon, authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active cars" ON public.cars FOR SELECT USING (active = true);

CREATE TABLE public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  required boolean NOT NULL DEFAULT true,
  placeholder text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.form_fields TO anon, authenticated;
GRANT ALL ON public.form_fields TO service_role;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active form fields" ON public.form_fields FOR SELECT USING (active = true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_cars_updated BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_form_fields_updated BEFORE UPDATE ON public.form_fields FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed cars
INSERT INTO public.cars (id,name,brand,price,year,category,short_desc,images,specs,sort_order) VALUES
('noir-gt','Noir GT Coupé','Aurelia',8500000,2025,'كوبيه رياضي','كوبيه فاخر بمحرك توين تيربو وتصميم أنيق يجمع بين القوة والرقي.','["car-1","car-6","car-3"]','{"engine":"V8 توين تيربو 4.0 لتر","power":"612 حصان","transmission":"أوتوماتيكي 8 سرعات","drive":"دفع خلفي","acceleration":"3.4 ثانية (0-100 كم/س)","topSpeed":"315 كم/س","fuel":"بنزين بريميوم","seats":"4 مقاعد"}',1),
('aurora-suv','Aurora Prestige SUV','Aurelia',7200000,2025,'SUV فاخرة','سيارة عائلية فاخرة تجمع بين الرحابة والأداء العالي وتقنيات السلامة.','["car-2","car-5","car-4"]','{"engine":"V6 توربو 3.0 لتر","power":"440 حصان","transmission":"أوتوماتيكي 9 سرعات","drive":"دفع رباعي","acceleration":"5.1 ثانية (0-100 كم/س)","topSpeed":"260 كم/س","fuel":"بنزين / هجين خفيف","seats":"7 مقاعد"}',2),
('scarlet-r','Scarlet R Sport','Velocia',12500000,2025,'سوبر كار','سيارة رياضية متطرفة الأداء، تجربة قيادة لا تُنسى على الإطلاق.','["car-3","car-1","car-6"]','{"engine":"V12 شفط طبيعي 6.5 لتر","power":"780 حصان","transmission":"أوتوماتيكي 7 سرعات DCT","drive":"دفع خلفي","acceleration":"2.8 ثانية (0-100 كم/س)","topSpeed":"340 كم/س","fuel":"بنزين بريميوم","seats":"مقعدين"}',3),
('lumen-ev','Lumen EV Sedan','Aurelia',6800000,2025,'سيدان كهربائية','سيدان كهربائية بمدى طويل وتقنيات قيادة ذاتية متقدمة.','["car-4","car-2","car-5"]','{"engine":"محركان كهربائيان","power":"520 حصان","transmission":"ناقل أحادي السرعة","drive":"دفع رباعي AWD","acceleration":"3.6 ثانية (0-100 كم/س)","topSpeed":"260 كم/س","fuel":"كهربائي — مدى 620 كم","seats":"5 مقاعد"}',4),
('obsidian-x','Obsidian X SUV','Velocia',9300000,2025,'SUV رياضية','إس يو في رياضية مع تصميم جريء وأداء استثنائي على كل التضاريس.','["car-5","car-2","car-4"]','{"engine":"V8 توين تيربو 4.4 لتر","power":"625 حصان","transmission":"أوتوماتيكي 8 سرعات","drive":"دفع رباعي xDrive","acceleration":"3.9 ثانية (0-100 كم/س)","topSpeed":"290 كم/س","fuel":"بنزين بريميوم","seats":"5 مقاعد"}',5),
('graphite-gt','Graphite Grand Tourer','Aurelia',11200000,2025,'غراند تورر','سيارة سياحية فاخرة لرحلات طويلة بأناقة لا مثيل لها وراحة مطلقة.','["car-6","car-1","car-3"]','{"engine":"W12 توين تيربو 6.0 لتر","power":"650 حصان","transmission":"أوتوماتيكي 8 سرعات","drive":"دفع رباعي","acceleration":"3.6 ثانية (0-100 كم/س)","topSpeed":"335 كم/س","fuel":"بنزين بريميوم","seats":"4 مقاعد"}',6);

-- Seed default form fields
INSERT INTO public.form_fields (name,label,type,required,placeholder,sort_order) VALUES
('first_name','الاسم','text',true,null,1),
('last_name','اللقب','text',true,null,2),
('phone','رقم الهاتف','tel',true,null,3),
('city','الولاية / المدينة','text',true,null,4),
('address','العنوان الكامل','text',true,null,5),
('notes','ملاحظات إضافية','textarea',false,null,6);
