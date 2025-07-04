
const StatsSection = () => {
  return (
    <div className="bg-orange-600">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Trusted by businesses worldwide
          </h2>
          <p className="mt-3 text-xl text-orange-200 sm:mt-4">
            Join thousands of businesses that use Rhino Review to manage their online reputation
          </p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-orange-200">
              Reviews Collected
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">
              2M+
            </dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-orange-200">
              Happy Customers
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">
              10k+
            </dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-orange-200">
              Star Rating Increase
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">
              34%
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default StatsSection;
