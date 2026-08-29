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

  const startSession = useCallback(
    (templateId: string, ctx: Parameters<typeof mutations.startSession>[2]) => {
      const result = mutations.startSession(dbRef.current, templateId, ctx);
      setDb(result.db);
      return result.session as PrayerSession | undefined;
    },
    [],
  );

  const createTemplateFromHowTo = useCallback((howToId: string) => {
    const result = mutations.createTemplateFromHowTo(dbRef.current, howToId);
    setDb(result.db);
    return result.templateId;
  }, []);

  const duplicateTemplate = useCallback((templateId: string) => {
    const result = mutations.duplicateTemplate(dbRef.current, templateId);
    setDb(result.db);
    return result.templateId;
  }, []);

  const startSinglePrayer = useCallback(
    (prayerId: string, ctx: Parameters<typeof mutations.startSinglePrayer>[2] = {}) => {
      const result = mutations.startSinglePrayer(dbRef.current, prayerId, ctx);
      setDb(result.db);
      return result.session as PrayerSession | undefined;
    },
    [],
  );

  const startBuiltSession = useCallback(
    (
      templateId: string | null,
      items: Parameters<typeof mutations.startBuiltSession>[2],
      ctx: Parameters<typeof mutations.startBuiltSession>[3],
      title?: string,
      planId?: string,
    ) => {
      const result = mutations.startBuiltSession(
        dbRef.current,
        templateId,
        items,
        ctx,
        title,
        planId,
      );
      setDb(result.db);
      return result.session as PrayerSession | undefined;
    },
    [],
  );

  const value = useMemo(
    () => ({
      db,
      ready,
      reset: () => setDb(createSeedDatabase()),
      toggleFavorite: (id: string) => setDb((d) => mutations.toggleFavorite(d, id)),
      upsertPrayer: (
        p: Parameters<typeof mutations.upsertPrayer>[1],
        v: Parameters<typeof mutations.upsertPrayer>[2],
      ) => setDb((d) => mutations.upsertPrayer(d, p, v)),
      addPrayerVersion: (v: Parameters<typeof mutations.addPrayerVersion>[1]) =>
        setDb((d) => mutations.addPrayerVersion(d, v)),
      addPrayerVariant: (
        basePrayerId: string,
        variant: Parameters<typeof mutations.addPrayerVariant>[2],
      ) => setDb((d) => mutations.addPrayerVariant(d, basePrayerId, variant)),
      setDefaultVariant: (id: string) => setDb((d) => mutations.setDefaultVariant(d, id)),
      deletePrayer: (id: string) => setDb((d) => mutations.deletePrayer(d, id)),
      saveTemplate: (
        t: Parameters<typeof mutations.saveTemplate>[1],
        items: Parameters<typeof mutations.saveTemplate>[2],
      ) => setDb((d) => mutations.saveTemplate(d, t, items)),
      deleteTemplate: (id: string) => setDb((d) => mutations.deleteTemplate(d, id)),
      toggleTemplateFavorite: (id: string) => setDb((d) => mutations.toggleTemplateFavorite(d, id)),
      duplicateTemplate,
      deleteHowTo: (id: string) => setDb((d) => mutations.deleteHowTo(d, id)),
      saveHowTo: (h: Parameters<typeof mutations.saveHowTo>[1]) =>
        setDb((d) => mutations.saveHowTo(d, h)),
      createTemplateFromHowTo,
      startSession,
      startBuiltSession,
      startSinglePrayer,
      setCursor: (id: string, cursor: number) => setDb((d) => mutations.setCursor(d, id, cursor)),
      toggleItemDone: (id: string) => setDb((d) => mutations.toggleItemDone(d, id)),
      saveSessionReflection: (sessionId: string, itemId: string, text: string) =>
        setDb((d) => mutations.saveSessionReflection(d, sessionId, itemId, text)),
      setSessionPassage: (sessionId: string, reference: string, text: string) =>
        setDb((d) => mutations.setSessionPassage(d, sessionId, reference, text)),
      finishSession: (id: string) => setDb((d) => mutations.finishSession(d, id)),
      deleteSession: (id: string) => setDb((d) => mutations.deleteSession(d, id)),
      saveSessionPlan: (plan: Parameters<typeof mutations.saveSessionPlan>[1]) =>
        setDb((d) => mutations.saveSessionPlan(d, plan)),
      deleteSessionPlan: (id: string) => setDb((d) => mutations.deleteSessionPlan(d, id)),
      addIntention: (i: Parameters<typeof mutations.addIntention>[1]) =>
        setDb((d) => mutations.addIntention(d, i)),
      saveImportDraft: (draft: Parameters<typeof mutations.saveImportDraft>[1]) =>
        setDb((d) => mutations.saveImportDraft(d, draft)),
      applyImportDraft: (id: string) => setDb((d) => mutations.applyImportDraft(d, id)),
      addSource: (s: Parameters<typeof mutations.addSource>[1]) =>
        setDb((d) => mutations.addSource(d, s)),
      upsertSource: (s: Parameters<typeof mutations.upsertSource>[1]) =>
        setDb((d) => mutations.upsertSource(d, s)),
      upsertMysteryContent: (c: Parameters<typeof mutations.upsertMysteryContent>[1]) =>
        setDb((d) => mutations.upsertMysteryContent(d, c)),
      deleteMysteryBody: (bodyKey: string) => setDb((d) => mutations.deleteMysteryBody(d, bodyKey)),
      addReflection: (r: Parameters<typeof mutations.addReflection>[1]) =>
        setDb((d) => mutations.addReflection(d, r)),
      updateReflection: (r: Parameters<typeof mutations.updateReflection>[1]) =>
        setDb((d) => mutations.updateReflection(d, r)),
      deleteReflection: (id: string) => setDb((d) => mutations.deleteReflection(d, id)),
      addKnowledgeItem: (i: Parameters<typeof mutations.addKnowledgeItem>[1]) =>
        setDb((d) => mutations.addKnowledgeItem(d, i)),
      updateKnowledgeItem: (i: Parameters<typeof mutations.updateKnowledgeItem>[1]) =>
        setDb((d) => mutations.updateKnowledgeItem(d, i)),
      setKnowledgeStatus: (
        id: string,
        status: Parameters<typeof mutations.setKnowledgeStatus>[2],
      ) => setDb((d) => mutations.setKnowledgeStatus(d, id, status)),
      deleteKnowledgeItem: (id: string) => setDb((d) => mutations.deleteKnowledgeItem(d, id)),
      toggleContentLinkFavorite: (itemId: string, linkIndex: number) =>
        setDb((d) => mutations.toggleContentLinkFavorite(d, itemId, linkIndex)),
      upsertVoice: (v: Parameters<typeof mutations.upsertVoice>[1]) =>
        setDb((d) => mutations.upsertVoice(d, v)),
      deleteVoice: (id: string) => setDb((d) => mutations.deleteVoice(d, id)),
      toggleChannelFavorite: (voiceId: string, channelId: string) =>
        setDb((d) => mutations.toggleChannelFavorite(d, voiceId, channelId)),
      addMassExperience: (m: Parameters<typeof mutations.addMassExperience>[1]) =>
        setDb((d) => mutations.addMassExperience(d, m)),
      setDailyTemplate: (templateId: string | undefined) =>
        setDb((d) => mutations.setDailyTemplate(d, templateId)),
      updateSettings: (patch: Parameters<typeof mutations.updateSettings>[1]) =>
        setDb((d) => mutations.updateSettings(d, patch)),
    }),
    [
      db,
      ready,
      startSession,
      startBuiltSession,
      startSinglePrayer,
      createTemplateFromHowTo,
      duplicateTemplate,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
