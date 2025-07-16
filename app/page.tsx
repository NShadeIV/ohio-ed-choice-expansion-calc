"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calculator } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  agi: z.preprocess((val) => Number(val), z.number().positive("AGI must be a positive number")),
  householdSize: z.preprocess(
    (val) => Number(val),
    z.number().int().positive("Household size must be a positive integer"),
  ),
})

type FormValues = z.infer<typeof formSchema>

export default function EdChoiceCalculator() {
  const [awards, setAwards] = useState<{ k8: number; high: number } | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agi: "",
      householdSize: "",
    },
  })

  function calculateFplRatio(agi: number, householdSize: number) {
    // Federal Poverty Level guidelines (2025 example - would need to be updated annually)
    // https://aspe.hhs.gov/sites/default/files/documents/dd73d4f00d8a819d10b2fdb70d254f7b/detailed-guidelines-2025.pdf
    const fplBase = 10150
    const fplBasePerPerson = 5500

    return agi / (fplBase + fplBasePerPerson * householdSize)
  }

  function calculateAwardRatio(fplRatio: number) {
    // https://education.ohio.gov/getattachment/Topics/Other-Resources/Scholarships/EdChoice-Expansion/EdChoice-Expansion-Resources/EdChoice-Expansion-Award-Amounts-FY26.xlsx.aspx?lang=en-US

    const cVal = 0.5

    if (fplRatio <= 4.5)
      return 1.0 // maximum award is 100%
    else
      return Math.max(
        0.1, // minimum award is 10%
        Math.pow(1 / cVal, 4.5) * Math.exp(Math.log(cVal) * fplRatio),
      )
  }

  function calculateAwards(agi: number, householdSize: number): { k8: number; high: number } {
    const fplRatio = calculateFplRatio(agi, householdSize)
    const awardRatio = calculateAwardRatio(fplRatio)

    return {
      k8: parseFloat((6166 * awardRatio).toFixed(2)),
      high: parseFloat((8408 * awardRatio).toFixed(2)),
    }
  }

  function onSubmit(values: FormValues) {
    setAwards(calculateAwards(values.agi, values.householdSize))
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-center text-3xl font-bold">EdChoice Expansion Award Calculator</h1>
      <p className="mb-8 text-center text-sm font-medium">
        Based on the{" "}
        <a
          className="text-blue-500 hover:underline"
          href="https://education.ohio.gov/Topics/Other-Resources/Scholarships/EdChoice-Expansion/EdChoice-Expansion-Resources"
        >
          EdChoice Expansion Resources
        </a>{" "}
        at the Ohio Department of Education
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Your Award</CardTitle>
          <CardDescription>
            Enter your Adjusted Gross Income (AGI) and household size to see the estimated award per student.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* AGI */}
              <FormField
                control={form.control}
                name="agi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjusted Gross Income (AGI)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input type="number" min="0" step="1" placeholder="45000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Line 11 of your federal tax returns or Line 3 of your Ohio tax returns
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Household size */}
              <FormField
                control={form.control}
                name="householdSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household Size</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" placeholder="4" {...field} />
                    </FormControl>
                    <FormDescription>Tax filers, spouses, and dependents listed on your tax returns</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Award
              </Button>
            </form>
          </Form>
        </CardContent>

        {awards && (
          <CardFooter className="flex flex-col gap-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              <Alert className={awards.k8 ? "border-blue-500" : "border-gray-300"}>
                <AlertTitle className="text-lg">Grades K-8</AlertTitle>
                <AlertDescription className="mt-2 text-2xl font-bold">
                  {awards.k8 ? `$${awards.k8.toLocaleString()}` : "Not Eligible"}
                </AlertDescription>
              </Alert>

              <Alert className={awards.high ? "border-green-500" : "border-gray-300"}>
                <AlertTitle className="text-lg">Grades 9-12</AlertTitle>
                <AlertDescription className="mt-2 text-2xl font-bold">
                  {awards.high ? `$${awards.high.toLocaleString()}` : "Not Eligible"}
                </AlertDescription>
              </Alert>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              These amounts are estimates and may change after official verification
            </p>
          </CardFooter>
        )}
      </Card>
    </main>
  )
}
