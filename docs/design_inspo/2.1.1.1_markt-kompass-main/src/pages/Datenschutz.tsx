import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-anton text-4xl mb-8">Datenschutzerklärung</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">1. Verantwortliche Stelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Elvision Analytics GmbH</p>
                <p>Julian Elsässer</p>
                <p>Steinstraße 20, 53773 Hennef</p>
                <p>E-Mail: hallo@kasona.ai</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">2. Erhebung und Speicherung personenbezogener Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Beim Besuch dieser Website werden folgende Daten automatisch erfasst:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>IP-Adresse des anfragenden Geräts</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Browsertyp und -version</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer-URL</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Zusätzlich erfassen wir personenbezogene Daten, wenn du:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>das Kontaktformular nutzt</li>
                  <li>dich für einen Newsletter anmeldest</li>
                  <li>mit uns über E-Mail in Kontakt trittst</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">3. Zweck der Datenverarbeitung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Wir verarbeiten Daten, um:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>eine fehlerfreie Bereitstellung der Website sicherzustellen</li>
                <li>Kontaktanfragen zu beantworten</li>
                <li>Dienstleistungen anzubieten und zu optimieren</li>
                <li>rechtliche Verpflichtungen zu erfüllen</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">4. Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Diese Website verwendet Cookies. Bei erstmaligem Besuch erscheint ein Cookie-Banner mit Opt-in-Funktion, 
                das zwischen essenziellen Cookies und Marketing/Statistik-Cookies unterscheidet.
              </p>
              <p>
                Einwilligungen werden dokumentiert und können jederzeit widerrufen werden.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">5. Rechte der Nutzer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Du hast jederzeit das Recht auf:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Auskunft über gespeicherte Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung deiner Daten</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Widerspruch gegen Verarbeitung zu Werbezwecken</li>
                <li>Datenübertragbarkeit</li>
              </ul>
              <p className="mt-2">
                Bitte richte dein Anliegen an: <span className="text-foreground">hallo@kasona.ai</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">6. Sicherheit</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Diese Website nutzt eine SSL-Verschlüsselung (https://) zum Schutz deiner Daten während der Übertragung.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-anton">7. Hinweis zur Pflicht gemäß DSGVO</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Wir verpflichten uns zum Schutz deiner personenbezogenen Daten und setzen die Anforderungen 
                der DSGVO vollumfänglich um.
              </p>
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

export default Datenschutz;