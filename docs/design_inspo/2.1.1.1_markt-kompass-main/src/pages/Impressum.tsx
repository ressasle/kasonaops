import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-anton text-4xl mb-8">Impressum</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">Angaben gemäß § 5 TMG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Betreiber</h3>
                <p>Elvision Analytics GmbH</p>
                <p>Julian Elsässer</p>
                <p>Steinstraße 20</p>
                <p>53773 Hennef</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Kontakt</h3>
                <p>E-Mail: hallo@kasona.ai</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Verantwortlich für den Inhalt</h3>
                <p>Julian Elsässer</p>
                <p>Steinstraße 20</p>
                <p>53773 Hennef</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-anton">Haftungsausschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
              <p>
                <strong>Keine Anlageberatung:</strong> Die hier bereitgestellten Informationen stellen keine Anlageberatung dar. 
                Die App dient ausschließlich der persönlichen Reflexion und Dokumentation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Impressum;