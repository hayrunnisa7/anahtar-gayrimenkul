-- pgvector eklentisini aç (Supabase'in tüm planlarında ücretsiz sunulan
-- standart bir PostgreSQL eklentisi). Prisma şemasında `extensions = [vector]`
-- / `postgresqlExtensions` preview feature'ı KULLANILMADI — bu kombinasyon
-- bazı Prisma sürümlerinde "drift detected" hatasına yol açan bilinen bir
-- sorun; bunun yerine eklenti burada doğrudan ham SQL ile açılıyor.
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "embedding" vector(384);
