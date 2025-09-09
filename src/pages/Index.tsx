import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PlanningPrevisional } from "@/components/planning/PlanningPrevisional";
import { PlanningHebdomadaire } from "@/components/planning/PlanningHebdomadaire";
import { Encadrants } from "@/components/encadrants/Encadrants";
import { Salaries } from "@/components/salaries/Salaries";
import { AffectationQuotidienne } from "@/components/affectation/AffectationQuotidienne";
import { FeuillesRoute } from "@/components/feuilles/FeuillesRoute";

const Index = () => {
  const [activeTab, setActiveTab] = useState("planning");

  const renderContent = () => {
    switch (activeTab) {
      case "planning":
        return <PlanningPrevisional />;
      case "encadrants":
        return <Encadrants />;
      case "salaries":
        return <Salaries />;
      case "affectation":
        return <AffectationQuotidienne />;
      case "hebdomadaire":
        return <PlanningHebdomadaire />;
      case "feuilles":
        return <FeuillesRoute />;
      default:
        return <PlanningPrevisional />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
