import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppStoreContext, loadDatabase, mutations, saveDatabase } from "@/lib/prayer/store";
import { createSeedDatabase } from "@/lib/prayer/seed";
import type { Database, PrayerSession } from "@/lib/prayer/types";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => createSeedDatabase());
  const [ready, setReady] = useState(false);
  const dbRef = useRef(db);
  dbRef.current = db;

  useEffect(() => {
    setDb(loadDatabase());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDatabase(db);
  }, [db, ready]);

  const startSession = useCallback((templateId: string, ctx: Parameters<typeof mutations.startSession>[2]) => {
    const result = mutations.startSession(dbRef.current, templateId, ctx);
    setDb(result.db);
    return result.session as PrayerSession | undefined;
  }, []);

  const createTemplateFromHowTo = useCallback((howToId: string) => {
    const result = mutations.createTemplateFromHowTo(dbRef.current, howToId);
    setDb(result.db);
    return result.templateId;
  }, []);

  const value = useMemo(
    () => ({
      db,
      ready,
      reset: () => setDb(createSeedDatabase()),
      toggleFavorite: (id: string) => setDb((d) => mutations.toggleFavorite(d, id)),
      upsertPrayer: (p: Parameters<typeof mutations.upsertPrayer>[1], v: Parameters<typeof mutations.upsertPrayer>[2]) =>
        setDb((d) => mutations.upsertPrayer(d, p, v)),
      addPrayerVersion: (v: Parameters<typeof mutations.addPrayerVersion>[1]) =>
        setDb((d) => mutations.addPrayerVersion(d, v)),
      addPrayerVariant: (
        basePrayerId: string,
        variant: Parameters<typeof mutations.addPrayerVariant>[2],
      ) => setDb((d) => mutations.addPrayerVariant(d, basePrayerId, variant)),
      setDefaultVariant: (id: string) => setDb((d) => mutations.setDefaultVariant(d, id)),
      deletePrayer: (id: string) => setDb((d) => mutations.deletePrayer(d, id)),
      saveTemplate: (t: Parameters<typeof mutations.saveTemplate>[1], items: Parameters<typeof mutations.saveTemplate>[2]) =>
        setDb((d) => mutations.saveTemplate(d, t, items)),
      deleteTemplate: (id: string) => setDb((d) => mutations.deleteTemplate(d, id)),
      deleteHowTo: (id: string) => setDb((d) => mutations.deleteHowTo(d, id)),
      saveHowTo: (h: Parameters<typeof mutations.saveHowTo>[1]) =>
        setDb((d) => mutations.saveHowTo(d, h)),
      createTemplateFromHowTo,
      startSession,
      setCursor: (id: string, cursor: number) => setDb((d) => mutations.setCursor(d, id, cursor)),
      toggleItemDone: (id: string) => setDb((d) => mutations.toggleItemDone(d, id)),
      finishSession: (id: string) => setDb((d) => mutations.finishSession(d, id)),
      deleteSession: (id: string) => setDb((d) => mutations.deleteSession(d, id)),
      addIntention: (i: Parameters<typeof mutations.addIntention>[1]) =>
        setDb((d) => mutations.addIntention(d, i)),
      addNovenaInstance: (n: Parameters<typeof mutations.addNovenaInstance>[1]) =>
        setDb((d) => mutations.addNovenaInstance(d, n)),
      deleteNovenaInstance: (id: string) => setDb((d) => mutations.deleteNovenaInstance(d, id)),
      saveImportDraft: (draft: Parameters<typeof mutations.saveImportDraft>[1]) =>
        setDb((d) => mutations.saveImportDraft(d, draft)),
      applyImportDraft: (id: string) => setDb((d) => mutations.applyImportDraft(d, id)),
      addSource: (s: Parameters<typeof mutations.addSource>[1]) =>
        setDb((d) => mutations.addSource(d, s)),
      addReflection: (r: Parameters<typeof mutations.addReflection>[1]) =>
        setDb((d) => mutations.addReflection(d, r)),
      deleteReflection: (id: string) => setDb((d) => mutations.deleteReflection(d, id)),
      addLearningItem: (i: Parameters<typeof mutations.addLearningItem>[1]) =>
        setDb((d) => mutations.addLearningItem(d, i)),
      setLearningStatus: (id: string, status: Parameters<typeof mutations.setLearningStatus>[2]) =>
        setDb((d) => mutations.setLearningStatus(d, id, status)),
      deleteLearningItem: (id: string) => setDb((d) => mutations.deleteLearningItem(d, id)),
      addMassExperience: (m: Parameters<typeof mutations.addMassExperience>[1]) =>
        setDb((d) => mutations.addMassExperience(d, m)),
    }),
    [db, ready, startSession, createTemplateFromHowTo],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
