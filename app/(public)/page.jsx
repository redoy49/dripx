import HomeHero from "./_components/HomeHero";
import IntegrationCrosshairGrid from "./_components/IntegrationCrosshairGrid";
import CloudWorkflowSection from "./_components/CloudWorkflowSection";
import InteractiveProductTabs from "./_components/InteractiveProductTabs";
import ComparisonAndFaq from "./_components/ComparisonAndFaq";

export default function HomePage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-clip">
      <HomeHero />
      <IntegrationCrosshairGrid />
      <CloudWorkflowSection />
      <InteractiveProductTabs />
      <ComparisonAndFaq />
    </div>
  );
}
