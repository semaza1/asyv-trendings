import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getUserField, isStudent } from "@/utils/auth";

const AccessDenied = () => {
  const navigate = useNavigate();
  const userField = getUserField();
  const getFieldDisplayName = (field) => {
    const fieldMap = {
      news: "News",
      opportunities: "Opportunities",
      events: "Events",
      sports: "Sports",
      visitors: "Visitors",
      "did-you-know": "Did You Know",
      projects: "Projects",
    };
    return field ? fieldMap[field] || field : "";
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/20 dark:to-orange-950/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isStudent() && userField ? (
              <>
                You only have access to manage content in the{" "}
                <span className="font-semibold text-primary">
                  {getFieldDisplayName(userField)}
                </span>{" "}
                section.
              </>
            ) : (
              "You do not have permission to access this section."
            )}
          </p>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => navigate("/admin")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>

            {isStudent() && userField && (
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/${userField}`)}
                className="w-full"
              >
                Go to {getFieldDisplayName(userField)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
