-- CreateTable
CREATE TABLE "assets" (
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("ticker")
);

-- CreateTable
CREATE TABLE "sentiment_analyses" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL,
    "sentiment_score" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "change_24h" DOUBLE PRECISION,
    "ai_insights" TEXT,
    "correlation" DOUBLE PRECISION,
    "sources_data" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sentiment_analyses_ticker_analysis_date_key" ON "sentiment_analyses"("ticker", "analysis_date");

-- AddForeignKey
ALTER TABLE "sentiment_analyses" ADD CONSTRAINT "sentiment_analyses_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "assets"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;
