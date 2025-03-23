<template>
  <div class="about text-justify">
    <div class="m-auto text-center">
      <h1 class="text-2xl font-bold">About Arguepedia</h1>
    </div>
    <p>
      Are you tired of having the same old debates over and over again? Going in circles with the same arguments? Well,
      then welcome to Arguepedia, where the "wisdom" of the masses can crystallize any debate into a crowdsourced font
      of oft-repeated knowledge. Instead of arguing in circles, perhaps you can push the edges of the debate and find
      something truly novel to contribute.</p>

    <h2 class="text-xl font-semibold mt-6">Anticipated Issues</h2>
    <div class="mt-4">
      <h3 class="font-bold">Redundancy</h3>
      <p>Right now, the search results try to warn you about similar or redundant statements, but there's no actual guard against them.  I anticipate in the future adding either a check or a way to merge statements and their connections, but there's also redundancy with inverted, negated, contrapositive, and other transformations, etc.</p>
      <h3 class="font-bold mt-4">Staleness</h3>
      <p>Granted, the point of the site is to sort of coalesce good arguments, but there does need to be some mechanism for newer posts to rise.  Right now I am implementing Wilson's score with a confidence interval of 2.33, which is supposed to be a happy medium.</p>
      <h3 class="font-bold mt-4">Optimization</h3>
      <p>Database operations currently use a lot of aggregation functions and indexing.  If things scale, I'll memoize certain columns like total votes, connections, etc.</p>
    </div>
  </div>
</template>
