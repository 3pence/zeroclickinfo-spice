package DDG::Spice::Gravatar;
# ABSTRACT: Shows gravatar of a given e-mail.

use DDG::Spice;
use Digest::MD5 qw(md5_hex);

triggers startend => "gravatar", "avatar of", "gravatar of";

spice to => 'http://jagtalon.duckduckgo.com:80/js/spice/gravatar_final/$1';

attribution github => ['https://github.com/adman','Adman'],
            twitter => ['http://twitter.com/adman_X','adman_X'];

handle remainder => sub {
    s/^\s+//;
    s/\s+$//;
    my $email_hash = md5_hex(lc $_);
    return $email_hash if defined $email_hash;
    return;
};

1;
