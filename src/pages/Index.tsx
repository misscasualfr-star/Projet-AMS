import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PlanningPrevisional } from "@/components/planning/PlanningPrevisional";
import { PlanningHebdomadaire } from "@/components/planning/PlanningHebdomadaire";
import { Encadrants } from "@/components/encadrants/Encadrants";
import { Salaries } from "@/components/salaries/Salaries";
import { AffectationQuotidienne } from "@/components/affectation/AffectationQuotidienne";

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
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Feuilles de route</h2>
            <p className="text-muted-foreground">Génération des feuilles de route PDF - À venir</p>
          </div>
        );
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
