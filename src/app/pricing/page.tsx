import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Container from '@/components/Container';

export default function PricingPage() {
  return (
    <Container>
      <div className="py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Basic Plan */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Plan</h2>
            <p className="text-4xl font-bold text-gray-900 mb-4">$0/month</p>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Up to 100 feedback items
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic AI analysis
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                5 clusters
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Email support
              </li>
            </ul>
            
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <a href="/login" className="block w-full h-full text-center">Get Started</a>
            </button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 text-center border-2 border-blue-500 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h2>
            <p className="text-4xl font-bold text-gray-900 mb-4">$100/month</p>
            <p className="text-gray-600 mb-6">For growing teams</p>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited feedback
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced AI insights
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited clusters
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Custom integrations
              </li>
            </ul>
            
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <a href="/login" className="block w-full h-full text-center">Start Pro Trial</a>
            </button>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16 feature-comparison">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Feature Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-b">Feature</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900 border-b">Basic</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900 border-b">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">Feedback Items</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">100</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">AI Insights</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Basic</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Advanced</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">Clusters</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">5</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">Support</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Email</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Priority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Integrations</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">-</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Beta Features Note */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Beta features available
          </Badge>
          <p className="text-gray-600">
            Try our latest AI-powered features before they're officially released
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans later?
              </h4>
              <p className="text-gray-600">
                Absolutely! You can upgrade or downgrade your plan at any time.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What happens after my trial?
              </h4>
              <p className="text-gray-600">
                After your trial ends, you'll be automatically charged for the Pro plan. You can cancel anytime before the trial ends.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a setup fee?
              </h4>
              <p className="text-gray-600">
                No setup fees! You only pay the monthly subscription cost. We believe in transparent, simple pricing.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Can I cancel my subscription anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What happens to my data if I modify my subscription?
              </h4>
              <p className="text-gray-600">
                Your data is always safe. When you downgrade, you'll lose access to Pro features but all your feedback and analysis remains intact.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer team discounts?
              </h4>
              <p className="text-gray-600">
                For teams of 5+ users, we offer custom pricing. Contact us to discuss your needs and get a personalized quote.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of teams using SignalNote to improve their products
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base">
              <a href="/login" className="block w-full h-full text-center">Start Your Trial</a>
            </button>
            <button className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base">
              <a href="/waitlist" className="block w-full h-full text-center">Join Waitlist</a>
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
} 